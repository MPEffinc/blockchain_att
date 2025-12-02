// contract/deploy.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// ES module에서 __dirname 흉내
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) .env = Project/.env 읽기
dotenv.config({
  path: path.join(__dirname, "..", ".env"),  // ../.env
});

// 디버그용(한 번만 확인해보고 나중에 지워도 됨)
console.log("RPC_URL:", process.env.RPC_URL);
console.log("PRIVATE_KEY prefix:", process.env.PRIVATE_KEY?.slice(0, 10));

// 2) provider / wallet 설정
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function main() {
  console.log("Deploying contract...");

  // 3) ABI/BIN = contract 폴더 안 파일 읽기
  const abiPath = path.join(__dirname, "contract_Attendance_sol_Attendance.abi");
  const binPath = path.join(__dirname, "contract_Attendance_sol_Attendance.bin");

  const abi = fs.readFileSync(abiPath, "utf8");
  const bin = fs.readFileSync(binPath, "utf8");

  const factory = new ethers.ContractFactory(abi, bin, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed at:", contract.target);
}

main().catch(console.error);
