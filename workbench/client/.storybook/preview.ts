import type { Preview } from '@storybook/angular';
import { initialize, mswLoader } from 'msw-storybook-addon';

initialize();

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
