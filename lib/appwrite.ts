import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";
import { openAuthSessionAsync } from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    const { jwt } = await account.createJWT();
    console.log("JWT Appwrite", jwt);

    const user = await account.get();
    console.log("User from Appwrite:", user);
    const { name, email } = user;

    console.log("User info:", name, email);

    if (!session) throw new Error("Failed to create session");

    // Paso nuevo: Obtener JWT del backend
    const jwtResponse = await fetch(
      "http://192.168.50.53:8080/api/auth/appwrite",
      {
        method: "POST",
        headers: {
          "X-Appwrite-Session": jwt,
          "Content-Type": "application/json",
        },
      }
    );

    if (!jwtResponse.ok) throw new Error("Failed to get JWT token");

    const { token: jwtToken } = await jwtResponse.json();
    await AsyncStorage.setItem("jwtToken", jwtToken);
    console.log("jwtToken", jwtToken);

    const userID = await fetch("http://192.168.50.53:8080/user/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!userID.ok) {
      throw new Error(`HTTP error! status: ${userID.status}`);
    }

    const userData = await userID.json();
    console.log("Datos del usuario:", userData);

    await AsyncStorage.setItem("userId", userData.id.toString());
    console.log("ID guardado correctamente");

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
