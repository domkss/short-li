const originalArrayOfDummyURLs = [
  {
    name: "ExampleSite1",
    url: "https://www.examplesite1-abcdefghijklmnopqrstuvwx.com",
    shortURL: "abc1234",
    clickCount: 153420,
  },
  {
    name: "SampleSite2",
    url: "https://www.samplesite2-qrstuvwxyz1234567890.net",
    shortURL: "def5678",
    clickCount: 78923,
  },
  {
    name: "WebPortal3",
    url: "https://www.webportal3-abcdefghijklmnopqrstuvwxyz.org",
    shortURL: "ghi9101",
    clickCount: 124567,
  },
  {
    name: "GlobalHub4",
    url: "https://www.globalhub4-0123456789abcdefghij.info",
    shortURL: "jkl2345",
    clickCount: 42000,
  },
  {
    name: "VirtualWorld5",
    url: "https://www.virtualworl-ijklmnopqrstuvwxyzabcdefgh.com",
    shortURL: "mno6789",
    clickCount: 175000,
  },
  {
    name: "TechInnovate6",
    url: "https://www.techinnovat-0123456789abcdefghijklmnopqrstuvwxyz.com",
    shortURL: "pqr1234",
    clickCount: 98000,
  },
  {
    name: "NexusNetwork7",
    url: "https://www.nexusnetwor-abcdefghijklmnopqrstuvwxyz1234567890.com",
    shortURL: "stu5678",
    clickCount: 60000,
  },
  {
    name: "DataSphere8",
    url: "https://www.datasphere8-abcdefghijklmnopqrstuvwx12.dev",
    shortURL: "vwx9101",
    clickCount: 150000,
  },
  {
    name: "QuantumLink9",
    url: "https://www.quantumlink9-3456789abcdefghijklmnopqrstuvwxyzabc.pro",
    shortURL: "yz01234",
    clickCount: 30000,
  },
  {
    name: "CyberSpace10",
    url: "https://www.cyberspace10-defghijklmnopqrstuvwxyzabcdefghijklmno.io",
    shortURL: "abc5678",
    clickCount: 75000,
  },
  {
    name: "ExampleSite11",
    url: "https://www.examplesite11-zyxwvutsrqponmlkjihgfedcba9876543210.com",
    shortURL: "def9101",
    clickCount: 125000,
  },
  {
    name: "SampleSite12",
    url: "https://www.samplesite12-9876543210abcdefghijklmnopqrstuvwxyz.net",
    shortURL: "ghi2345",
    clickCount: 100000,
  },
  {
    name: "WebPortal13",
    url: "https://www.webportal13-abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx.org",
    shortURL: "jkl6789",
    clickCount: 180000,
  },
  {
    name: "GlobalHub14",
    url: "https://www.globalhub14-klmnopqrstuvwxyz1234567890abcdefghijklmnopqr.info",
    shortURL: "mno1234",
    clickCount: 45000,
  },
  {
    name: "VirtualWorld15",
    url: "https://www.virtualworl15-uvwxyz1234567890abcdefghijklmnopqrstuvwxyz.com",
    shortURL: "pqr5678",
    clickCount: 160000,
  },
  {
    name: "TechInnovate16",
    url: "https://www.techinnovat16-0123456789abcdefghijklmnopqrstuvwxyzabcdefgh.com",
    shortURL: "stu9101",
    clickCount: 120000,
  },
  {
    name: "NexusNetwork17",
    url: "https://www.nexusnetwor17-ijklmnopqrstuvwxyzabcdefgh.com",
    shortURL: "vwx2345",
    clickCount: 90000,
  },
  {
    name: "DataSphere18",
    url: "https://www.datasphere18-0123456789abcdefghijklmnopqrstuvwxyzabcdef.dev",
    shortURL: "yz5678",
    clickCount: 42000,
  },
  {
    name: "QuantumLink19",
    url: "https://www.quantumlink19-3456789abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabc.pro",
    shortURL: "abc9101",
    clickCount: 170000,
  },
  {
    name: "CyberSpace20",
    url: "https://www.cyberspace20-defghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmno.io",
    shortURL: "def2345",
    clickCount: 85000,
  },
  { name: "LongURLEntry", url: "https://www.longurlentry-".padEnd(2048, "X"), shortURL: "ghi5678", clickCount: 190000 },
];

export const DummyURLs = copyAndExpand(originalArrayOfDummyURLs);

export function copyAndExpand(array: { name: string; url: string; shortURL: string; clickCount: number }[]) {
  // Copy the array and return a new array three times larger
  let newArray = [...array];
  newArray = newArray.concat([...newArray, ...newArray]);
  newArray = newArray.concat([...newArray, ...newArray]);
  return newArray.concat([...newArray, ...newArray]);
}
