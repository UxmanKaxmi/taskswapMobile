import React from 'react';

import TextElement from '@shared/components/TextElement/TextElement';
import { type InfoModalPayload } from '../modalTypes';
import { vs } from 'react-native-size-matters';

type Props = {
  payload: InfoModalPayload;
};

export default function InfoModalContent({ payload }: Props) {
  return (
    <>
      <TextElement
        style={{
          fontWeight: '600',
          marginBottom: vs(7),
        }}
        variant="title"
        color="text"
      >
        {payload.title}
      </TextElement>

      {payload.description && (
        <TextElement variant="body" color="muted">
          {payload.description}
        </TextElement>
      )}
    </>
  );
}
