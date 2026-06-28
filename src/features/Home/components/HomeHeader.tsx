import React, { ReactNode } from 'react';
import Row from '@shared/components/Layout/Row';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vs } from 'react-native-size-matters';
import AppLogo from '@shared/components/AppLogo';
import { isIOS } from '@shared/utils/constants';

type Props = {
  rightAccessory?: ReactNode;
};

export default function HomeHeader({ rightAccessory }: Props) {
  //Safe area is needed for here for the animation.
  const insets = useSafeAreaInsets();

  return (
    <Row
      justify="space-between"
      style={{
        paddingTop: isIOS ? insets.top : insets.top + vs(10),
      }}
    >
      <AppLogo size="md" align="left" />
      {rightAccessory}
    </Row>
  );
}
