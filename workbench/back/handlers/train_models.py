import logging

from flask import jsonify, request, url_for
from flask_login import current_user

from redash.handlers.base import (
    BaseResource,
    filter_by_tags,
    get_object_or_404,
    org_scoped_rule,
    paginate,
    routes,
    order_results as _order_results,
)
from redash.permissions import (
    has_access,
    not_view_only,
    require_access,
    require_permission,
    require_any_of_permission,
    view_only,
)
from redash import models

from redash.tasks.queries import execute_train_query
from redash.models.train_model import TrainModel

logger = logging.getLogger(__name__)


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

class TrainModelsResource(BaseResource):
    @require_permission("create_query")
    def post(self):
        logger.debug(f'wgkim request.data : {request.data}')
        input_def = request.get_json(force=True)
        logger.debug(f'wgkim input_def : {input_def}')
        return {"results": TrainModel.train_model(**input_def)}

    @require_permission("view_query")
    def get(self):
        # model 목록
        logger.debug("handler get entered")
        return {"results": TrainModel.show_models()}

class TrainModelResource(BaseResource):
    # model 삭제
    @require_permission("edit_query")
    def delete(self, model_name):
        logger.debug("handler delete entered")
        return {"results": TrainModel.drop_model(model_name)}


class TrainModelTypesResource(BaseResource):
    def get(self):
        logger.debug("handler get entered at TrainModelTypes")
        return {"results": TrainModel.show_modeltypes()}

class HyperparametersResource(BaseResource):
    def get(self):
        logger.debug("handler get entered at TrainModelTypes")
        return {"results": TrainModel.show_hyperparameters()}

class TrainModelTrainingsResource(BaseResource):
    def get(self):
        logger.debug("handler get entered at TrainModelTrainings")
        return {"results": TrainModel.show_trainings()}

def serialize_train_query_result(query_result):
    return query_result


# Added by jscho 2023-08-18
def run_query(
    param_query_text, data_source
):
    if data_source.paused:
        if data_source.pause_reason:
            message = "{} is paused ({}). Please try later.".format(
                data_source.name, data_source.pause_reason
            )
        else:
            message = "{} is paused. Please try later.".format(data_source.name)

        return error_response(message)

    query_result = execute_train_query(
        param_query_text,
        data_source.id,
        metadata={},
        user_id=current_user.id,
        is_api_key=current_user.is_api_user(),
    )

    return serialize_train_query_result(query_result)


# Added by jscho 2023-08-18
class TrainTargetPreviewResource(BaseResource):
    @require_permission("edit_query")
    def post(self):
        params = request.get_json(force=True)

        query_text = params["query"]
 
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
            query_text,
            data_source,
        )


# Added by wgkim 2023-09-07 : 마이그레이션 가져오기, 내보내기 기능 추가
class TrainModelExportResource(BaseResource):
    def get(self):
        model_name = request.args.get('model_name')

        logger.debug(f'handler export {model_name} to local')
        return {"results":TrainModel.export_model(model_name)}

class TrainModelImportResource(BaseResource):
    def post(self):
        logger.debug('handler import asdf')
        data = request.get_json(force=True)

        logger.debug(f'handler import {data["model_name"]} from {data["hex_string"][:16]}... to TrainDB')
        return {"results":TrainModel.import_model(data["model_name"], data["hex_string"])}
