import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";

export const config = {
  platform: "com.dinaxis.cutpark",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");
    console.log("Redirect URI:", redirectUri);

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );

    if (!response) throw new Error("Create OAuth2 token failed...");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    if (browserResult.type !== "success")
      throw new Error("Authentication failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    if (!secret || !userId)
      throw new Error("Missing authentication parameters");

    const session = await account.createSession(userId, secret);
    const token = session.$id; // Session token (JWT) used to authenticate requests
    console.log("Session Token:", token);
    if (!session) throw new Error("Failed to create session");

    // Step 1: Fetch user info from Appwrite
    const user = await account.get();
    const { name, email } = user;

    console.log("User info:", name, email);

    // Step 2: Send user data to API
    const apiUrl = "http://192.168.0.177:8080/user/info"; // Replace with your API URL

    const responseApi = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Cookie: `JSESSIONID=${token}`, // Pass the OAuth2 session token
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    if (!responseApi.ok) throw new Error("Failed to save user data");

    if (responseApi.ok) console.log("User saved in database");

    console.log("User data saved successfully");

    return true;
  } catch (error) {
    console.error("Login Error:", error);
    return false;
  }
}
export async function logout() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const response = await account.get();

    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);

      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
