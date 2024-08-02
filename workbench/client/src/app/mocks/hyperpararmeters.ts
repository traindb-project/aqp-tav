import { HyperParameter } from '../dto';

export const HYPER_PARAMETER_LIST: HyperParameter[] = [
  {
    modeltype: 'rspn',
    name: 'rdc_threshold',
    type: 'float',
    default_value: '0.3',
    description: 'threshold for determining correlation'
  },
  {
    modeltype: 'tablegan',
    name: 'random_dim',
    type: 'int',
    default_value: '100',
    description: 'the size of the random sample passed to the generator'
  },
  {
    modeltype: 'tablegan',
    name: 'num_channels',
    type: 'int',
    default_value: '64',
    description: 'the number of channels'
  },
  {
    modeltype: 'tablegan',
    name: 'l2scale',
    type: 'float',
    default_value: '1e-5',
    description: 'regularization term'
  },
  {
    modeltype: 'tablegan',
    name: 'batch_size',
    type: 'int',
    default_value: '500',
    description: 'the number of samples to process in each step'
  },
  {
    modeltype: 'tablegan',
    name: 'epochs',
    type: 'int',
    default_value: '300',
    description: 'the number of training epochs'
  },
  {
    modeltype: 'ctgan',
    name: 'embedding_dim',
    type: 'int',
    default_value: '128',
    description: 'the size of the random sample passed to the generator'
  },
  {
    modeltype: 'ctgan',
    name: 'generator_dim',
    type: 'tuple or list of ints',
    default_value: '(256, 256)',
    description: 'the size of the output samples for each one of the residuals'
  },
  {
    modeltype: 'ctgan',
    name: 'discriminator_dim',
    type: 'tuple or list of ints',
    default_value: '(256, 256)',
    description: 'the size of the output samples for each one of the discriminator layers'
  },
  {
    modeltype: 'ctgan',
    name: 'generator_lr',
    type: 'float',
    default_value: '2e-4',
    description: 'the learning rate for the generator'
  },
  {
    modeltype: 'ctgan',
    name: 'generator_decay',
    type: 'float',
    default_value: '1e-6',
    description: 'generator weight decay for the Adam optimizer'
  },
  {
    modeltype: 'ctgan',
    name: 'discriminator_lr',
    type: 'float',
    default_value: '2e-4',
    description: 'the learning rate for the discriminator'
  },
  {
    modeltype: 'ctgan',
    name: 'discriminator_decay',
    type: 'float',
    default_value: '1e-6',
    description: 'discriminator weight decay for the Adam optimizer'
  },
  {
    modeltype: 'ctgan',
    name: 'batch_size',
    type: 'int',
    default_value: '500',
    description: 'the number of samples to process in each step'
  },
  {
    modeltype: 'ctgan',
    name: 'epochs',
    type: 'int',
    default_value: '300',
    description: 'the number of training epochs'
  },
  {
    modeltype: 'ctgan',
    name: 'pac',
    type: 'int',
    default_value: '10',
    description: 'the number of samples to group together when applying the discriminator'
  },
  {
    modeltype: 'octgan',
    name: 'embedding_dim',
    type: 'int',
    default_value: '128',
    description: 'the size of the random sample passed to the generator'
  },
  {
    modeltype: 'octgan',
    name: 'gen_dim',
    type: 'tuple or list of ints',
    default_value: '(128, 128)',
    description: 'the size of the output samples for each one of the residuals'
  },
  {
    modeltype: 'octgan',
    name: 'dis_dim',
    type: 'tuple or list of ints',
    default_value: '(128, 128)',
    description: 'the size of the output samples for each one of the discriminator layers'
  },
  {
    modeltype: 'octgan',
    name: 'lr',
    type: 'float',
    default_value: '2e-3',
    description: 'the learning rate for the generator and discriminator'
  },
  {
    modeltype: 'octgan',
    name: 'l2scale',
    type: 'float',
    default_value: '1e-6',
    description: 'regularization term'
  },
  {
    modeltype: 'octgan',
    name: 'batch_size',
    type: 'int',
    default_value: '500',
    description: 'the number of samples to process in each step'
  },
  {
    modeltype: 'octgan',
    name: 'epochs',
    type: 'int',
    default_value: '300',
    description: 'the number of training epochs'
  },
  {
    modeltype: 'octgan',
    name: 'num_split',
    type: 'int',
    default_value: '3',
    description: 'the number of splits for the discriminator'
  },
  {
    modeltype: 'stasy',
    name: 'epochs',
    type: 'int',
    default_value: '10000',
    description: 'the number of training epochs'
  },
  {
    modeltype: 'tvae',
    name: 'embedding_dim',
    type: 'int',
    default_value: '128',
    description: 'the size of the random sample passed to the generator'
  },
  {
    modeltype: 'tvae',
    name: 'compress_dims',
    type: 'tuple or list of ints',
    default_value: '(128, 128)',
    description: 'the size of each hidden layer in the encoder'
  },
  {
    modeltype: 'tvae',
    name: 'decompress_dims',
    type: 'tuple or list of ints',
    default_value: '(128, 128)',
    description: 'the size of each hidden layer in the decoder'
  },
  {
    modeltype: 'tvae',
    name: 'l2scale',
    type: 'float',
    default_value: '1e-5',
    description: 'regularization term'
  },
  {
    modeltype: 'tvae',
    name: 'batch_size',
    type: 'int',
    default_value: '500',
    description: 'the number of samples to process in each step'
  },
  {
    modeltype: 'tvae',
    name: 'epochs',
    type: 'int',
    default_value: '300',
    description: 'the number of training epochs'
  },
  {
    modeltype: 'tvae',
    name: 'loss_factor',
    type: 'int',
    default_value: '2',
    description: 'the multiplier for the reconstruction error'
  },
  {
    modeltype: 'wyjang',
    name: 'random_dim',
    type: 'int',
    default_value: '100',
    description: 'the size of the random sample passed to the generator'
  },
  {
    modeltype: 'wyjang',
    name: 'num_channels',
    type: 'int',
    default_value: '64',
    description: 'the number of channels'
  },
  {
    modeltype: 'wyjang',
    name: 'l2scale',
    type: 'float',
    default_value: '1e-5',
    description: 'regularization term'
  },
  {
    modeltype: 'wyjang',
    name: 'batch_size',
    type: 'int',
    default_value: '500',
    description: 'the number of samples to process in each step'
  },
  {
    modeltype: 'wyjang',
    name: 'epochs',
    type: 'int',
    default_value: '300',
    description: 'the number of training epochs'
  },
  {
    modeltype: 'TableGAN_Test',
    name: 'random_dim',
    type: 'int',
    default_value: '100',
    description: 'the size of the random sample passed to the generator'
  },
  {
    modeltype: 'TableGAN_Test',
    name: 'num_channels',
    type: 'int',
    default_value: '64',
    description: 'the number of channels'
  },
  {
    modeltype: 'TableGAN_Test',
    name: 'l2scale',
    type: 'float',
    default_value: '1e-5',
    description: 'regularization term'
  },
  {
    modeltype: 'TableGAN_Test',
    name: 'batch_size',
    type: 'int',
    default_value: '500',
    description: 'the number of samples to process in each step'
  },
  {
    modeltype: 'TableGAN_Test',
    name: 'epochs',
    type: 'int',
    default_value: '300',
    description: 'the number of training epochs'
  }
];
