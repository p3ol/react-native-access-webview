import { Text, View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import {
  AccessContext,
  Snippet,
  RestrictedContent,
  Paywall,
} from '@poool/react-native-access-webview';

export default function App() {
  return (
    <ScrollView>
      <AccessContext
        appId="CknhMIMaTpNFRkEfkXB6d7EIZBQl4VPuPQgTlaChiulgdVeURmHlLBMeGu8wgJiF"
        config={{ cookies_enabled: true, debug: true }}
      >
        <SafeAreaView style={styles.container}>
          <View collapsable={false} style={styles.wrapper}>
            <Text style={styles.title}>Poool Access Example</Text>
            <Snippet>
              <Text>Synopsis</Text>
            </Snippet>
            <RestrictedContent>
              <Text>Full content</Text>
            </RestrictedContent>
            <Paywall />
          </View>
        </SafeAreaView>
      </AccessContext>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
