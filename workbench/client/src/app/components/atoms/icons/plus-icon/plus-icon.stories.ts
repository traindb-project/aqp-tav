import type { Meta, StoryObj } from '@storybook/angular';
import { PlusIconComponent } from './plus-icon.component';

type StoryType = PlusIconComponent;

const meta: Meta<StoryType> = {
  component: PlusIconComponent,
  title: 'atoms/icons/PlusIconComponent',
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

export const Solid: Story = {
  args: {
    type: 'solid',
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

export const Outline: Story = {
  args: {
    type: 'outline',
  },
  // render: (args) => {
  //   const { ...props } = args;
  //   return {
  //     props,
  //     template: ``
  //   };
  // }
};
