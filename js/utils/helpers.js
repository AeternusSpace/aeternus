export const parseIPFS = url => {
  return `https://ipfs.fleek.co/ipfs/${url.substring(7)}`;
}