import * as AuthSession from 'expo-auth-session';
import { TokenTypeHint, useAutoDiscovery } from 'expo-auth-session';
import { FC, useCallback } from 'react';
import { ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';

import { logout } from '@/store/features/authenticationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import i18n from '@/utils/i18n';

/**
 * The props for the LogoutButton component.
 */
type LogoutButtonProps = {
  /**
   * The mode of the button.
   */
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';

  /**
   * The style of the container.
   */
  style?: ViewStyle;
};

/**
 * The button for logging out of the app.
 * @constructor
 */
const LogoutButton: FC<LogoutButtonProps> = ({ mode, style }) => {
  // Store hooks
  const authState = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // OIDC settings
  const oidcDiscoveryUrl = process.env.EXPO_PUBLIC_OIDC_DISCOVERY_URL;
  const oidcClientId = process.env.EXPO_PUBLIC_OIDC_CLIENT_ID;

  // OIDC discovery
  const discovery = useAutoDiscovery(oidcDiscoveryUrl);

  const handleLogoutPress = useCallback(async () => {
    if (authState.state !== 'authenticated') {
      return;
    }

    const token = authState.token;

    try {
      // Revoke the access token
      const res = await AuthSession.revokeAsync(
        {
          clientId: oidcClientId,
          token,
          tokenTypeHint: TokenTypeHint.AccessToken,
        },
        discovery,
      );

      // Dispatch the logout action
      if (res) {
        dispatch(logout());
      }
    } catch (e) {
      console.error(e);
    }
  }, [authState, discovery, dispatch, oidcClientId]);

  return (
    <Button
      mode={mode ?? 'contained'}
      onPress={handleLogoutPress}
      style={style}
    >
      {i18n.t('login.logout')}
    </Button>
  );
};

export default LogoutButton;
