import logging
import time

import unicodedata
from flask import make_response, request
from flask_login import current_user
from flask_restful import abort
from werkzeug.urls import url_quote
from redash import models, settings
from redash.handlers.base import BaseResource, get_object_or_404, record_event
from redash.permissions import (
    has_access,
    not_view_only,
    require_access,
    require_permission,
    require_any_of_permission,
    view_only,
)
from redash.tasks import Job
from redash.tasks.queries import execute_workbench_query
from redash.utils import (
    collect_parameters_from_request,
    json_dumps,
    utcnow,
    to_filename,
)
from redash.models.parameterized_query import (
    ParameterizedQuery,
    InvalidParameterError,
    QueryDetachedFromDataSourceError,
    dropdown_values,
)
from redash.serializers import (
    serialize_query_result,
    serialize_query_result_to_dsv,
    serialize_query_result_to_xlsx,
    serialize_job,
)


def error_response(message, http_status=400):
    return {"job": {"status": 4, "error": message}}, http_status


error_messages = {
    "unsafe_when_shared": error_response(
        "This query contains potentially unsafe parameters and cannot be executed on a shared dashboard or an embedded visualization.",
        403,
    ),
    "unsafe_on_view_only": error_response(
        "This query contains potentially unsafe parameters and cannot be executed with read-only access to this data source.",
        403,
    ),
    "no_permission": error_response(
        "You do not have permission to run queries with this data source.", 403
    ),
    "select_data_source": error_response(
        "Please select data source to run this query.", 401
    ),
}


# Added by jscho 2023-04-28
def run_query(
    param_query_text, parameters, data_source, workbench_id, should_apply_auto_limit, max_age=0
):
    if data_source.paused:
        if data_source.pause_reason:
            message = "{} is paused ({}). Please try later.".format(
                data_source.name, data_source.pause_reason
            )
        else:
            message = "{} is paused. Please try later.".format(data_source.name)

        return error_response(message)

    query_text = data_source.query_runner.apply_auto_limit(
        param_query_text, should_apply_auto_limit
    )

    if max_age == 0:
        query_result = None
    else:
        query_result = models.WorkbenchQueryResult.get_latest(data_source, query_text, max_age)

    record_event(
        current_user.org,
        current_user,
        {
            "action": "execute_workbench_query",
            "cache": "hit" if query_result else "miss",
            "object_id": data_source.id,
            "object_type": "data_source",
            "query": query_text,
            "workbench_id": workbench_id,
            "parameters": parameters,
        },
    )

    if query_result is None:
        query_result = execute_workbench_query(
            query_text,
            data_source.id,
            metadata={
                "Username": repr(current_user)
                if current_user.is_api_user()
                else current_user.email,
                "workbench_id": workbench_id,
            },
            user_id=current_user.id,
            is_api_key=current_user.is_api_user(),
        )
    return {
        "workbench_query_result": serialize_query_result(
            query_result, current_user.is_api_user()
        )
    }


# Added by jscho 2023-04-28
class WorkbenchResultListResource(BaseResource):
    @require_permission("execute_query")
    def post(self):
        """
        Execute a workbench query (or retrieve recent results).

        :qparam string query: The query text to execute
        :qparam number workbench_id: The workbench object to update with the result (optional)
        :qparam number max_age: If workbench query results less than `max_age` seconds old are available,
                                return them, otherwise execute the query; if omitted or -1, returns
                                any cached result, or executes if not available. Set to zero to
                                always execute.
        :qparam number data_source_id: ID of data source to query
        :qparam object parameters: A set of parameter values to apply to the query.
        """
        params = request.get_json(force=True)

        param_query_text = params["query"]
        
        max_age = params.get("max_age", -1)
        # max_age might have the value of None, in which case calling int(None) will fail
        if max_age is None:
            max_age = -1
        max_age = int(max_age)
        workbench_id = params.get("workbench_id", "adhoc")
        parameters = params.get(
            "parameters", collect_parameters_from_request(request.args)
        )

        should_apply_auto_limit = params.get("apply_auto_limit", False)

        data_source_id = params.get("data_source_id")
        if data_source_id:
            data_source = models.DataSource.get_by_id_and_org(
                params.get("data_source_id"), self.current_org
            )
        else:
            return error_messages["select_data_source"]

        if not has_access(data_source, self.current_user, not_view_only):
            return error_messages["no_permission"]

        return run_query(
            param_query_text,
            parameters,
            data_source,
            workbench_id,
            should_apply_auto_limit,
            max_age,
        )


def get_download_filename(query_result, query, filetype):
    retrieved_at = query_result.retrieved_at.strftime("%Y_%m_%d")
    if query:
        filename = to_filename(query.name) if query.name != "" else str(query.id)
    else:
        filename = str(query_result.id)
    return "{}_{}.{}".format(filename, retrieved_at, filetype)


def content_disposition_filenames(attachment_filename):
    if not isinstance(attachment_filename, str):
        attachment_filename = attachment_filename.decode("utf-8")

    try:
        attachment_filename = attachment_filename.encode("ascii")
    except UnicodeEncodeError:
        filenames = {
            "filename": unicodedata.normalize("NFKD", attachment_filename).encode(
                "ascii", "ignore"
            ),
            "filename*": "UTF-8''%s" % url_quote(attachment_filename, safe=b""),
        }
    else:
        filenames = {"filename": attachment_filename}

    return filenames

ONE_YEAR = 60 * 60 * 24 * 365.25


# Added by jscho 2023-04-28
class WorkbenchResultResource(BaseResource):
    @staticmethod
    def add_cors_headers(headers):
        if "Origin" in request.headers:
            origin = request.headers["Origin"]

            if set(["*", origin]) & settings.ACCESS_CONTROL_ALLOW_ORIGIN:
                headers["Access-Control-Allow-Origin"] = origin
                headers["Access-Control-Allow-Credentials"] = str(
                    settings.ACCESS_CONTROL_ALLOW_CREDENTIALS
                ).lower()

    @require_any_of_permission(("view_query", "execute_query"))
    def options(self, query_id=None, query_result_id=None, filetype="json"):
        headers = {}
        self.add_cors_headers(headers)

        if settings.ACCESS_CONTROL_REQUEST_METHOD:
            headers[
                "Access-Control-Request-Method"
            ] = settings.ACCESS_CONTROL_REQUEST_METHOD

        if settings.ACCESS_CONTROL_ALLOW_HEADERS:
            headers[
                "Access-Control-Allow-Headers"
            ] = settings.ACCESS_CONTROL_ALLOW_HEADERS

        return make_response("", 200, headers)

    @require_any_of_permission(("view_query", "execute_query"))
    def post(self, workbench_id):
        pass

    @require_any_of_permission(("view_query", "execute_query"))
    def get(self, workbench_id=None, workbench_query_result_id=None, filetype="json"):
        """
        Retrieve workbench query results.

        :param number workbench_id: The ID of the query whose results should be fetched
        :param number workbench_query_result_id: the ID of the query result to fetch
        :param string filetype: Format to return. One of 'json', 'xlsx', or 'csv'. Defaults to 'json'.

        :<json number id: workbench query result ID
        :<json string workbench query: workbench query that produced this result
        :<json string workbench_query_hash: Hash code for query text
        :<json object data: workbench query output
        :<json number data_source_id: ID of data source that produced this result
        :<json number runtime: Length of execution time in seconds
        :<json string retrieved_at: workbench query retrieval date/time, in ISO format
        """

        should_cache = workbench_query_result_id is not None

        workbench_query_result = None
        workbench = None

        if workbench_query_result_id:
            workbench_query_result = get_object_or_404(
                models.WorkbenchQueryResult.get_by_id_and_org, workbench_query_result_id, self.current_org
            )

        if workbench_id is not None:
            workbench = get_object_or_404(
                models.Workbench.get_by_id_and_org, workbench_id, self.current_org
            )

            if (
                workbench_query_result is None
                and workbench is not None
                and workbench.latest_query_data_id is not None
            ):
                workbench_query_result = get_object_or_404(
                    models.WorkbenchQueryResult.get_by_id_and_org,
                    workbench.latest_query_data_id,
                    self.current_org,
                )

            if (
                workbench is not None
                and workbench_query_result is not None
                and self.current_user.is_api_user()
            ):
                if workbench.query_hash != workbench_query_result.query_hash:
                    abort(404, message="No cached result found for this query.")

        if workbench_query_result:
            require_access(workbench_query_result.data_source, self.current_user, view_only)

            if isinstance(self.current_user, models.ApiUser):
                event = {
                    "user_id": None,
                    "org_id": self.current_org.id,
                    "action": "api_get",
                    "api_key": self.current_user.name,
                    "file_type": filetype,
                    "user_agent": request.user_agent.string,
                    "ip": request.remote_addr,
                }

                if workbench_id:
                    event["object_type"] = "workbench"
                    event["object_id"] = workbench_id
                else:
                    event["object_type"] = "workbench_query_result"
                    event["object_id"] = workbench_query_result_id

                self.record_event(event)

            response_builders = {
                "json": self.make_json_response,
                "xlsx": self.make_excel_response,
                "csv": self.make_csv_response,
                "tsv": self.make_tsv_response,
            }
            response = response_builders[filetype](workbench_query_result)

            if len(settings.ACCESS_CONTROL_ALLOW_ORIGIN) > 0:
                self.add_cors_headers(response.headers)

            if should_cache:
                response.headers.add_header(
                    "Cache-Control", "private,max-age=%d" % ONE_YEAR
                )

            filename = get_download_filename(workbench_query_result, workbench, filetype)

            filenames = content_disposition_filenames(filename)
            response.headers.add("Content-Disposition", "attachment", **filenames)

            return response

        else:
            abort(404, message="No cached result found for this query.")

    @staticmethod
    def make_json_response(workbench_query_result):
        data = json_dumps({"workbench_query_result": workbench_query_result.to_dict()})
        headers = {"Content-Type": "application/json"}
        return make_response(data, 200, headers)

    @staticmethod
    def make_csv_response(workbench_query_result):
        headers = {"Content-Type": "text/csv; charset=UTF-8"}
        return make_response(
            serialize_query_result_to_dsv(workbench_query_result, ","), 200, headers
        )

    @staticmethod
    def make_tsv_response(workbench_query_result):
        headers = {"Content-Type": "text/tab-separated-values; charset=UTF-8"}
        return make_response(
            serialize_query_result_to_dsv(workbench_query_result, "\t"), 200, headers
        )

    @staticmethod
    def make_excel_response(workbench_query_result):
        headers = {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        return make_response(serialize_query_result_to_xlsx(workbench_query_result), 200, headers)
