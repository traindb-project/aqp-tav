import type { Meta, StoryObj } from '@storybook/angular';
import { DashboardItemInputComponent } from './dashboard-item-input.component';

type StoryType = DashboardItemInputComponent;

const meta: Meta<StoryType> = {
  component: DashboardItemInputComponent,
  title: 'organisms/dashboard/DashboardItemInputComponent',
  // tags: ['autodocs'],
  // decorators: [
  //   applicationConfig({
  //     providers: [
  //       provideRouter([]),
  //       provideHttpClient(),
  //     ],
  //   }),
  //   moduleMetadata({
  //     //👇 Imports both components to allow component composition with Storybook
  //     imports: [/* Modules or Components */],
  //   }),
  // ],
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
    data: {
      columns: ['order_id', 'product_id', 'add_to_cart_order', 'reordered'],
      types: ['INTEGER', 'INTEGER', 'INTEGER', 'INTEGER'],
      data: [
        [2, 1819, 8, 1],
        [2, 9327, 3, 0],
        [2, 17794, 6, 1],
        [2, 28985, 2, 1],
        [2, 30035, 5, 0],
        [2, 33120, 1, 1],
        [2, 40141, 7, 1],
        [2, 43668, 9, 0],
        [2, 45918, 4, 1],
        [3, 17461, 7, 3],
      ],
      execution_time: 0.8363462835550308
    }
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
};
