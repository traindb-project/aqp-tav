import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { delay, http, HttpResponse } from 'msw';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { monacoConfig } from '../../../../config';
import { DATABASE_LIST } from '../../../../mocks';
import { QueryFormPageComponent } from './query-form-page.component';

type StoryType = QueryFormPageComponent;

const meta: Meta<StoryType> = {
  component: QueryFormPageComponent,
  title: 'pages/queries/QueryFormPageComponent',
  // tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ],
    }),
    moduleMetadata({
      //👇 Imports both components to allow component composition with Storybook
      imports: [MonacoEditorModule.forRoot(monacoConfig)],
    }),
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
  // },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/databases?*', async () => {
          await delay(500);
          return HttpResponse.json(DATABASE_LIST);
        }),
      ]
    }
  }
};
