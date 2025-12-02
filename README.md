# INU Blockchain Attendance Checking System
.env 파일 제외됨.

## How to Use?
.env file 생성(하단 참조)
./compile 실행하여 스마트 컨트랙트 배포
배포 주소 .env에 최신화 후
node server.js 를 통해 웹 서버 실행

## .env 구성
.env 파일은 프로젝트 루트 디렉터리 내에 구성되어야 합니다. 다음과 같은 요소를 포함합니다.
RPC_URL=<YOUR_POLYGON_RPC_URL> // Polygon 네트워크 앱에서 발급되는 RPC URL을 붙여넣습니다.
PRIVATE_KEY=0x<YOUR_PRIVATE_KEY> // 관리자 지갑 개인 키를 붙여넣습니다. (해당 부분은 보안 상 문제가 있어 개선하려 했으나, 아이디어가 떠오르지 않았습니다.)
CONTRACT_ADDRESS=0x<YOUR_CONTRACT_ADDRESS> // ./compile.sh을 실행 후, 출력되는 해시 값을 붙여넣습니다.


