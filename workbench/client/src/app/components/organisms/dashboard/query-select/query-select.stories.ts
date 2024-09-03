import { provideHttpClient } from '@angular/common/http';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { delay, http, HttpResponse } from 'msw';
import { QUERY_LIST } from '../../../../mocks';
import { QuerySelectComponent } from './query-select.component';

type StoryType = QuerySelectComponent;

const meta: Meta<StoryType> = {
  component: QuerySelectComponent,
  title: 'organisms/dashboard/QuerySelectComponent',
  // tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        // provideRouter([]),
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
  parameters: {
    msw: {
      handlers: [
        http.get('/api/queries?*', async () => {
          await delay(1500);
          return HttpResponse.json([...QUERY_LIST]);
        })
      ]
    }
  }
  // render: (args) => {
  //   const { ...props } = args;
  //   return {
  //     props,
  //     template: ``
  //   };
  // }
};
