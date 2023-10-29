import { Meta, Story } from '@storybook/react/types-6-0';
import VisibilityButton from './VisibilityButton';

export default {
  title: 'VisibilityButton',
  component: VisibilityButton,
} as Meta;

const Template: Story<{}> = args => <VisibilityButton {...args} />;

export const Default = Template.bind({});
