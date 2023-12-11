import sqlparse
from flask import jsonify, request, url_for
from flask_login import login_required
from flask_restful import abort
from sqlalchemy.orm.exc import StaleDataError
from funcy import partial

from redash import models, settings
from redash.authentication.org_resolving import current_org
from redash.handlers.base import (
    BaseResource,
    filter_by_tags,
    get_object_or_404,
    org_scoped_rule,
    paginate,
    routes,
    order_results as _order_results,
)
from redash.handlers.query_results import run_query
from redash.permissions import (
    can_modify,
    not_view_only,
    require_access,
    require_admin_or_owner,
    require_object_modify_permission,
    require_permission,
    view_only,
)
from redash.utils import collect_parameters_from_request
from redash.serializers import WorkbenchSerializer
from redash.models.parameterized_query import ParameterizedQuery


# Ordering map for relationships
order_map = {
    "name": "lowercase_name",
    "-name": "-lowercase_name",
    "created_at": "created_at",
    "-created_at": "-created_at",
    "schedule": "interval",
    "-schedule": "-interval",
    "runtime": "query_results-runtime",
    "-runtime": "-query_results-runtime",
    "executed_at": "query_results-retrieved_at",
    "-executed_at": "-query_results-retrieved_at",
    "created_by": "users-name",
    "-created_by": "-users-name",
}

order_results = partial(
    _order_results, default_order="-created_at", allowed_orders=order_map
)

# Added by jscho 2023-04-18
class BaseWorkbenchListResource(BaseResource):
    def get_workbenches(self, search_term):
        if search_term:
            results = models.Workbench.search(
                search_term,
                self.current_user.group_ids,
                self.current_user.id,
                include_drafts=True,
                multi_byte_search=current_org.get_setting("multi_byte_search_enabled"),
            )
        else:
            results = models.Workbench.all_queries(
                self.current_user.group_ids, self.current_user.id, include_drafts=True
            )
        return results

    # Added by wgkim 2023-08-04 : TrainDB에서 리스트 가져오기
    # def get_workbenches_from_train_db(self, search_term):
    #     print('[wgkim-debug] : start point')
    #     results = models.TrainModel.show_models()
    #     print('[wgkim-debug] results :', results)
    #     return results

    # @require_permission("view_query")
    def get(self):
        """
        Retrieve a list of workbenches.

        :qparam number page_size: Number of workbenches to return per page
        :qparam number page: Page number to retrieve
        :qparam number order: Name of column to order by
        :qparam number q: Full text search term

        Responds with an array of :ref:`query <query-response-label>` objects.
        """
        # See if we want to do full-text search or just regular queries
        search_term = request.args.get("q", "")

        # workbenches = self.get_workbenches(search_term)
        workbenches = self.get_workbenches(search_term)

        #results = filter_by_tags(workbenches, models.Workbench.tags)

        # order results according to passed order parameter,
        # special-casing search workbenches where the database
        # provides an order by search rank
        ordered_results = order_results(workbenches, fallback=not bool(search_term))

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)

        response = paginate(
            ordered_results,
            page=page,
            page_size=page_size,
            serializer=WorkbenchSerializer,
            with_stats=True,
            with_last_modified_by=False,
        )

        if search_term:
            self.record_event(
                {"action": "search", "object_type": "workbench", "term": search_term}
            )
        else:
            self.record_event({"action": "list", "object_type": "workbench"})

        return response

# Added by jscho 2023-04-18
class WorkbenchListResource(BaseWorkbenchListResource):
    @require_permission("create_query")
    def post(self):
        """
        Create a new Workbench query.

        :<json number data_source_id: The ID of the data source this query will run on
        :<json string query: Query text
        :<json string name:
        :<json string description:
        :<json object options: Query options
        """
        workbench_def = request.get_json(force=True)
        data_source = models.DataSource.get_by_id_and_org(
            workbench_def.pop("data_source_id"), self.current_org
        )
        require_access(data_source, self.current_user, not_view_only)

        for field in [
            "id",
            "created_at",
            "api_key",
            "visualizations",
            "latest_query_data",
            "last_modified_by",
        ]:
            workbench_def.pop(field, None)

        workbench_def["query_text"] = workbench_def.pop("query")
        workbench_def["user"] = self.current_user
        workbench_def["data_source"] = data_source
        workbench_def["org"] = self.current_org
        workbench_def["is_draft"] = True

        workbench = models.Workbench.create(**workbench_def)
        models.db.session.add(workbench)
        models.db.session.commit()

        self.record_event(
            {"action": "create", "object_id": workbench.id, "object_type": "workbench"}
        )

        return WorkbenchSerializer(workbench, with_visualizations=False).serialize()

# Added by jscho 2023-04-18
class WorkbenchResource(BaseResource):
    @require_permission("edit_query")
    def post(self, workbench_id):
        """
        Modify a workbench.

        :param workbench_id: ID of workbench to update
        :<json number data_source_id: The ID of the data source this workbench will run on
        :<json string query: Query text
        :<json string name:
        :<json string description:
        :<json string schedule: Schedule interval, in seconds, for repeated execution of this query
        :<json object options: Workbench options

        Responds with the updated :ref:`workbench <workbench-response-label>` object.
        """
        workbench = get_object_or_404(
            models.Workbench.get_by_id_and_org, workbench_id, self.current_org
        )
        workbench_def = request.get_json(force=True)

        require_object_modify_permission(workbench, self.current_user)

        for field in [
            "id",
            "created_at",
            "api_key",
            "visualizations",
            "latest_query_data",
            "user",
            "last_modified_by",
            "org",
        ]:
            workbench_def.pop(field, None)

        if "query" in workbench_def:
            workbench_def["query_text"] = workbench_def.pop("query")

        if "data_source_id" in workbench_def:
            data_source = models.DataSource.get_by_id_and_org(
                workbench_def["data_source_id"], self.current_org
            )
            require_access(data_source, self.current_user, not_view_only)

        workbench_def["last_modified_by"] = self.current_user
        workbench_def["changed_by"] = self.current_user
        # SQLAlchemy handles the case where a concurrent transaction beats us
        # to the update. But we still have to make sure that we're not starting
        # out behind.
        if "version" in workbench_def and workbench_def["version"] != workbench.version:
            abort(409)

        try:
            self.update_model(workbench, workbench_def)
            models.db.session.commit()
        except StaleDataError:
            abort(409)

        return WorkbenchSerializer(workbench, with_visualizations=False).serialize()

    # Updated by wgkim 2023-05-08 : query_id -> workbench_id 변경
    @require_permission("view_query")
    def get(self, workbench_id):
        pass

    @require_permission("edit_query")
    def delete(self, workbench_id):
        """
        delete a workbench.

        :param workbench_id: ID of workbench to delete
        """
        workbench = get_object_or_404(
            models.Workbench.get_by_id_and_org, workbench_id, self.current_org
        )
        require_object_modify_permission(workbench, self.current_user)
        models.db.session.delete(workbench)
        models.db.session.commit()

# Added by wgkim 2023-08-03 : 쿼리 검색 및 필터 기능 추가
class MyWorkbenchesResource(BaseResource):
    # @require_permission("view_query")
    def get(self):
        """
        Retrieve a list of queries created by the current user.

        :qparam number page_size: Number of queries to return per page
        :qparam number page: Page number to retrieve
        :qparam number order: Name of column to order by
        :qparam number search: Full text search term

        Responds with an array of :ref:`query <query-response-label>` objects.
        """
        search_term = request.args.get("q", "")
        if search_term:
            results = models.Workbench.search_by_user(search_term, self.current_user)
        else:
            results = models.Workbench.by_user(self.current_user)

        # results = filter_by_tags(results, models.Workbench.tags)

        # order results according to passed order parameter,
        # special-casing search queries where the database
        # provides an order by search rank
        ordered_results = order_results(results, fallback=not bool(search_term))

        page = request.args.get("page", 1, type=int)
        page_size = request.args.get("page_size", 25, type=int)
        return paginate(
            ordered_results,
            page,
            page_size,
            WorkbenchSerializer,
            with_stats=True,
            with_last_modified_by=False,
        )

# Added by wgkim 2023-08-03 : 쿼리 검색 및 필터 기능 추가
class WorkbenchSearchResource(BaseResource):
    # @require_permission("view_query")
    def get(self):
        """
        Search query text, names, and descriptions.

        :qparam string q: Search term
        :qparam number include_drafts: Whether to include draft in results

        Responds with a list of :ref:`query <query-response-label>` objects.
        """
        term = request.args.get("q", "")
        if not term:
            return []

        include_drafts = request.args.get("include_drafts") is not None

        self.record_event({"action": "search", "object_type": "workbench", "term": term})

        # this redirects to the new query list API that is aware of search
        new_location = url_for(
            "workbenches",
            q=term,
            org_slug=current_org.slug,
            drafts="true" if include_drafts else "false",
        )
        return {}, 301, {"Location": new_location}


