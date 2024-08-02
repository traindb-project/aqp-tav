import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { delay, http, HttpResponse } from 'msw';
import { COLUMN_LIST, DATABASE_LIST, HYPER_PARAMETER_LIST, SCHEMA_LIST, TABLE_PREVIEW } from '../../../../mocks';
import { TrainModelPageComponent } from './train-model-page.component';

type StoryType = TrainModelPageComponent;

const meta: Meta<StoryType> = {
  component: TrainModelPageComponent,
  title: 'pages/models/TrainModelPageComponent',
  // tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ],
    }),
    // moduleMetadata({
    //   //👇 Imports both components to allow component composition with Storybook
    //   imports: [/* Modules or Components */],
    // }),
  ],
  //   //👇 Wraps our stories with a decorator
  //   componentWrapperDecorator(
  //     (story) => `<div style="margin: 3em">${story}</div>`
  //   ),
  // ],
  // render: (args) => {
  //   const { ...props } = args;
  //   return {
  //     props,
  //     template: ``
  //   };
  // },
  /*
    See https://storybook.js.org/docs/react/api/arg-types
    Examples
    ex01) Text type -> label: { control: { type: 'text' } }
    ex02) Select type -> options: { options: ['a', 'b'], control: { type: 'select' } }
  */
  // parameters: {
  //   // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
  //   layout: 'fullscreen',
  // },
  // argTypes: {
  // },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Default: Story = {
  args: {
    // play: async ({ canvasElement }) => {
    // //   More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
    //   const canvas = within(canvasElement);
    //   await userEvent.click(...);
    // },
  },
  // render: (args) => {
  //   const { ...props } = args;
  //   return {
  //     props,
  //     template: ``
  //   };
  // }
  parameters: {
    msw: {
      handlers: [
        http.get('/api/databases*', async () => {
          await delay(500);
          return HttpResponse.json([...DATABASE_LIST]);
        }),
        http.get('/api/tables?*', async () => {
          await delay(500);
          return HttpResponse.json(SCHEMA_LIST.map(schema => ({ ...schema })));
        }),
        http.post('/api/tables/preview', async () => {
          await delay(500);
          return HttpResponse.json(TABLE_PREVIEW);
        }),
        http.get('/api/tables/*', async () => {
          await delay(500);
          return HttpResponse.json([...COLUMN_LIST]);
        }),
        http.get('/api/hyperparameters?*', async () => {
          await delay(500);
          return HttpResponse.json([...HYPER_PARAMETER_LIST]);
        }),
        http.post('/api/models/train', async () => {
          await delay(500);
          return HttpResponse.json(null);
        })
      ]
    }
  }
};
