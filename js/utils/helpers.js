export const parseIPFS = url => {
  return `https://infura-ipfs.io/ipfs/${url.substring(7)}`;
}