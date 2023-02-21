import { verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers";

export default NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "UserEmail",
          type: "text",
          placeholder: "email address",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await connectToDatabase();
        const db = client.db("auth-demo");

        const usersCollection = db.collection("users");
        const existingUser = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!existingUser) {
          client.close();
          throw new Error("No user found");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error("Could not log you in");
        }

        client.close();
        return { email: user.email };

        // const res = await fetch("/your/endpoint", {
        //   method: "POST",
        //   body: JSON.stringify(credentials),
        //   headers: { "Content-Type": "application/json" },
        // });
        // const user = await res.json();

        // // If no error and we have user data, return it
        // if (res.ok && user) {
        //   return user;
        // }
        // // Return null if user data could not be retrieved
        // return null;
      },
    }),
  ],
  //   callbacks: {
  //     async jwt({ token, account }) {
  //       return token;
  //     },
  //     async session({ session }) {
  //       const client = await connectToDatabase();
  //       const db = client.db("auth-demo");

  //       const usersCollection = db.collection("users");
  //       const existingUser = await usersCollection.findOne({
  //         email: credentials.email,
  //       });

  //       session.user = existingUser;
  //       return session;
  //     },
  //   },
});
