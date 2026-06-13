export type PushButtonProps = {
  onPress: () => void;
  label?: string;
  activeLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  variant?: 'default' | 'push' | 'cheer';
};
