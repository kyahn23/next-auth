import { verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const client = await connectToDatabase();
        const db = client.db("auth-demo");

        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          client.close();
          throw new Error("No user found");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error("Could not you log in");
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
};

const handler = (req, res) => NextAuth(req, res, options);

export default handler;

// export default NextAuth({
//   session: { strategy: "jwt" },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: {
//           label: "UserEmail",
//           type: "text",
//           placeholder: "email address",
//         },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const client = await connectToDatabase();
//         const db = client.db("auth-demo");

//         const usersCollection = db.collection("users");
//         const existingUser = await usersCollection.findOne({
//           email: credentials.email,
//         });

//         if (!existingUser) {
//           client.close();
//           throw new Error("No user found");
//         }

//         const isValid = await verifyPassword(
//           credentials.password,
//           user.password
//         );

//         if (!isValid) {
//           client.close();
//           throw new Error("Could not log you in");
//         }

//         client.close();
//         return { email: user.email };
//       },
//     }),
//   ],
//   //   callbacks: {
//   //     async jwt({ token, account }) {
//   //       return token;
//   //     },
//   //     async session({ session }) {
//   //       const client = await connectToDatabase();
//   //       const db = client.db("auth-demo");

//   //       const usersCollection = db.collection("users");
//   //       const existingUser = await usersCollection.findOne({
//   //         email: credentials.email,
//   //       });

//   //       session.user = existingUser;
//   //       return session;
//   //     },
//   //   },
// });
