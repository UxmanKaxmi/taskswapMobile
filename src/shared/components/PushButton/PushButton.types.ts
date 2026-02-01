export type PushButtonProps = {
  count: number;
  onPress: () => void;
  disabled?: boolean;
  label?: string; // default: "Pushes"
  size?: 'sm' | 'md';
};
