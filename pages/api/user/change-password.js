import { hashPassword, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSession } from "next-auth/react";

async function handler(req, res) {
  // 요청 메서드 확인
  if (req.method !== "PATCH") {
    return;
  }

  let client;
  try {
    // client가 먼저 선언되어있어야 session 확인시 에러가 나도 finally에서 client close 가능

    // MongoDB에 연결
    const client = await connectToDatabase();

    // 세션 확인
    const session = await getSession({ req: req });
    if (!session) {
      res.status(401).json({ message: "Not authenticated!" });
      return;
    }

    // 세션과 요청 본문에서 사용자 정보 가져오기
    const userEmail = session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    // 사용자 문서 가져오기
    const usersCollection = client.db("auth-demo").collection("users");
    const user = await usersCollection.findOne({ email: userEmail });

    // 사용자가 존재하는지 확인
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 이전 비밀번호 검증
    const currentPassword = user.password;
    const passwordAreEqual = await verifyPassword(oldPassword, currentPassword);
    if (!passwordAreEqual) {
      // 403 - 금지됨 == 접근권한없음 / 422 - 처리할 수 없음 == 클라이언트의 요청은 유효하지만 서버가 요청을 처리할 수 없는 경우
      res.status(422).json({ message: "Invalid password." });
      return;
    }

    // 새 비밀번호를 해시하여 사용자 문서 업데이트
    const hashedPassword = await hashPassword(newPassword);
    await usersCollection.updateOne(
      { email: userEmail },
      { $set: { password: hashedPassword } }
    );

    // 비밀번호 변경 성공
    res.status(200).json({ message: "Password updated!" });
  } catch (error) {
    // 오류 처리
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // MongoDB 클라이언트 닫기
    if (client) {
      client.close();
    }
  }
}

export default handler;
