from tests import BaseTestCase

from redash.models import User, Organization, DataSource, Workbench


class WorkbenchTestByUser(BaseTestCase):
    def test_returns_only_users_all_workbenches(self):
        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        print(current_user)
        print(current_org)

        search_term = None

        if search_term:
            results = Workbench.search(
                search_term,
                current_user.group_ids,
                current_user.id,
                include_drafts=True,
                multi_byte_search=current_org.get_setting("multi_byte_search_enabled"),
            )
        else:
            results = Workbench.all_queries(
                current_user.group_ids, current_user.id, include_drafts=True
            )

        print(results)