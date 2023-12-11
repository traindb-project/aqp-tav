import time
from tests import BaseTestCase

from redash.models.train_model import TrainModel

class TestTrainModel(BaseTestCase):

   def test_traindb(self):

      ret = TrainModel.show_modeltypes()
      print(ret)
