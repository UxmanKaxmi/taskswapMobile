import React, { useEffect } from 'react';
import { View, Text, Button, Alert, Image, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../authProvider';
import { api } from '@shared/api/axios';
import { moderateScale } from 'react-native-size-matters';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Icon from '@react-native-vector-icons/fontawesome6';
import Column from '@shared/components/Layout/Column';
import { Height } from '@shared/components/Spacing';
import AnimatedTextRotatorWithTitle from '../components/AnimatedTextRotatorWithTitle';
import AnimatedBackground from '@shared/components/Layout/AnimatedBackground';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { user, signIn, signOut, loading } = useAuth();

  // async function pingServer() {
  //   try {
  //     const res = await api.get('/health');
  //     if (res.status === 200 && res.data.ok) {
  //       console.log('✅ Backend is reachable!', res.data);
  //     } else {
  //       console.warn('⚠️ Health check returned non-OK', res);
  //     }
  //   } catch (err) {
  //     console.error('❌ Cannot reach backend:', err);
  //   }
  // }
  // useEffect(() => {
  //   pingServer();
  // }, []);

  // if (user) {
  //   return (
  //     <View style={{ padding: 20 }}>
  //       <Text>Welcome, {user.name}</Text>
  //       {user.photo && (
  //         <Image source={{ uri: user.photo }} style={{ width: 80, height: 80, borderRadius: 40 }} />
  //       )}
  //       <Button title="Sign Out" onPress={signOut} />
  //     </View>
  //   );
  // }

  return (
    <Layout>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: height * 0.08,
        }}
      >
        <Image
          source={require('@assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Height size={50} />

      <Column flex>
        {/* <AnimatedTextRotatorWithTitle
          messages={[
            {
              mainTitle: 'Welcome',
              title: 'Swap small tasks. Earn big smiles.',
              subtitle: 'Let your friends make your day easier',
              image: require('@assets/images/loginImage1.png'),
            },
            {
              mainTitle: 'Welcome to TaskSwap',

              title: 'Because “Can someone remind me?” just got an app.',
              subtitle: 'Your crew’s got your back.',
              image: require('@assets/images/loginImage2.png'),
            },
            {
              mainTitle: 'Hey there!',

              title: 'Need a favor? Want to help?',
              subtitle: 'This is where fun tasks meet friendly people.',
              image: require('@assets/images/loginImage3.png'),
            },
            {
              mainTitle: 'Welcome',
              title: 'Tiny tasks. Real connections.',
              subtitle: 'Ask, remind, decide — together.',
              image: require('@assets/images/loginImage4.png'),
            },
          ]}
          interval={5000}
        /> */}
        <TextElement variant="title" style={styles.title}>
          Welcome to TaskSwap
        </TextElement>

        <TextElement variant="subtitle" style={styles.subtitle}>
          Tiny tasks. Real connections.
          {'\n'}
          Ask, remind, decide — together.
        </TextElement>
      </Column>
      <Height size={20} />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          isLoading={loading}
          title="Continue with Google"
          onPress={async () => {
            // setIsLoading(true);
            try {
              await signIn();
            } catch (e: any) {
              Alert.alert('Login failed', e.message || 'Unknown error');
            } finally {
              // setIsLoading(true);
            }
          }}
          // icon={<Icon name="google" color={'white'} iconStyle="brand" />}
        />
      </View>
    </Layout>
  );
}
const styles = StyleSheet.create({
  logoWrapper: {
    alignItems: 'center',
    // marginBottom: moderateScale(40),
  },
  logo: {
    width: width * 0.4,
    height: height * 0.1,
    alignSelf: 'center',
  },
  brand: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginTop: moderateScale(8),
    color: '#222',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: moderateScale(30),
  },
  subtitle: {
    fontSize: moderateScale(20),
    color: '#555',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    height: moderateScale(48),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#f1c40f',
    backgroundColor: 'transparent',
  },
  fillButton: {
    backgroundColor: '#f1c40f',
  },
  outlineText: {
    color: '#f1c40f',
    fontWeight: '600',
  },
  fillText: {
    color: '#fff',
    fontWeight: '600',
  },
});
