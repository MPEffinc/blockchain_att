import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ethers } from "ethers";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // index.html, view.html, admin.html 등 서빙

// ----------------------- 블록체인 설정 ----------------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

const abi = [
  "function logAttendance(string userId, string networkInfo, uint256 timestamp) public",
  "function getCount() public view returns (uint256)",
  "function getRecord(uint256 index) public view returns (string userId, string networkInfo, uint256 timestamp)",
  "function isAdmin(address user) public view returns (bool)",
  "function resetRecords() public"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

// ----------------------- 출석 기록 저장 API ------------------------
app.post("/api/attendance", async (req, res) => {
  try {
    const { userId, networkInfo /*, deviceInfo*/ } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId required" });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    console.log("출석 요청:", { userId, networkInfo, timestamp });

    // 온체인에는 userId, networkInfo, timestamp만 저장
    const tx = await contract.logAttendance(
      userId,
      networkInfo || "",
      timestamp
    );
    await tx.wait();

    console.log("출석 완료 TX:", tx.hash);

    res.json({ success: true, txHash: tx.hash });

  } catch (err) {
    console.error("출석 오류:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------- 출석 기록 조회 API ------------------------
app.get("/api/records", async (req, res) => {
  try {
    const countBN = await contract.getCount();
    const count = Number(countBN);

    console.log("총 기록:", count);

    const result = [];

    // 최신순 역순으로 push
    for (let i = count - 1; i >= 0; i--) {
      const [userId, networkInfo, timestampBN] =
        await contract.getRecord(i);

      result.push({
        index: i,
        userId,
        networkInfo,
        timestamp: Number(timestampBN),
      });
    }

    res.json({ success: true, records: result });

  } catch (err) {
    console.error("조회 오류:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------- 관리자 인증 (지갑 서명 기반) --------------
app.post("/api/admin/login", async (req, res) => {
  try {
    const { message, signature } = req.body;

    if (!signature) {
      return res.json({ success: false, error: "No signature" });
    }

    // 1) 서명에서 지갑 주소 복원
    const recovered = ethers.verifyMessage(message, signature);
    console.log("복원된 서명 지갑주소:", recovered);

    // 2) 컨트랙트에서 admin인지 조회
    const isAdmin = await contract.isAdmin(recovered);

    res.json({ success: isAdmin });

  } catch (err) {
    console.error("관리자 인증 오류:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------- 관리자: 기록 리셋 ------------------------
app.post("/api/reset", async (req, res) => {
  try {
    const { signer } = req.body;
    if (!signer) {
      return res.status(400).json({ success: false, error: "No signer" });
    }

    // 컨트랙트 쪽 isAdmin으로 재확인해도 되고, 
    // 여기서 ENV 기반 화이트리스트 한번 더 체크해도 됨(optional)
    const isAdmin = await contract.isAdmin(signer);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Not admin" });
    }

    const tx = await contract.resetRecords();
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });

  } catch (err) {
    console.error("리셋 오류:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------- 서버 IP 제공 API ------------------------
app.get("/api/server-ip", (req, res) => {
  const nets = os.networkInterfaces();
  let localIP = "localhost";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        localIP = net.address;
      }
    }
  }

  res.json({ ip: localIP });
});


// ----------------------- 서버 실행 ------------------------
app.listen(3000, () => {
  const nets = os.networkInterfaces();
  let localIP = "localhost";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        localIP = net.address;
      }
    }
  }
  console.log(`Server running on http://${localIP}:3000`);
});
