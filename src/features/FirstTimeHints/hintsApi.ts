import { api, CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import type {
  FirstTimeHintId,
  FirstTimeHintMap,
  FirstTimeHintWrittenState,
} from './firstTimeHints';

// Idempotent server write. Completions are also recorded server-side by the
// push/cheer/progress mutations, so a lost request here is self-healing.
export async function writeFirstTimeHintState(
  hintId: FirstTimeHintId,
  state: FirstTimeHintWrittenState,
): Promise<FirstTimeHintMap> {
  const response = await api.post<{ firstTimeHints: FirstTimeHintMap }>(
    buildRoute.firstTimeHint(hintId),
    { state },
    { skipToast: true } as CustomAxiosRequestConfig,
  );

  return response.data.firstTimeHints;
}

// Testing convenience: wipes the caller's own map so the hints re-teach.
export async function resetFirstTimeHintsOnServer(): Promise<void> {
  await api.delete(buildRoute.firstTimeHintsReset(), {
    skipToast: true,
  } as CustomAxiosRequestConfig);
}
