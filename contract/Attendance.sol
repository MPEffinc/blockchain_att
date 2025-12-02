// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Attendance {
    struct Record {
        string userId;
        string networkInfo;
        uint256 timestamp;
    }

    address public admin;
    Record[] public records;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    // 출석 기록
    function logAttendance(
        string memory userId,
        string memory networkInfo,
        uint256 timestamp
    ) public {
        records.push(Record(userId, networkInfo, timestamp));
    }

    // 전체 개수
    function getCount() public view returns (uint256) {
        return records.length;
    }

    // 인덱스로 하나 조회
    function getRecord(uint256 index)
        public
        view
        returns (string memory, string memory, uint256)
    {
        require(index < records.length, "out of range");
        Record memory r = records[index];
        return (r.userId, r.networkInfo, r.timestamp);
    }

    // 관리자 여부 확인
    function isAdmin(address user) public view returns (bool) {
        return user == admin;
    }

    // 관리자: 모든 기록 삭제
    function resetRecords() public onlyAdmin {
        delete records;
    }
}
