// https://dev.to/sudo_overflow/diy-generating-dynamic-images-on-the-fly-for-email-marketing-h51
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  // registerFont,
  createCanvas,
  loadImage,
} from 'canvas';
import { getSimpleStringFromParam } from '../../../helpers/strings';

// TODO: Update this section:
const certificateBackgroundImage = './public/background.svg';
// const fontFile = './fonts/Sign-Painter-Regular.ttf';
const fontFamily = 'signpainter';
const svg = 'svg';
const dot = '.';
const imagePng = 'image/png';

// TODO registerFont(fontFile, { family: fontFamily });

type CanvasTypeDef = 'pdf' | 'svg' | undefined;
type BufferTypeDef = 'image/png' | undefined;

function parseFileName(imageFileNameString: string) {
  const extension = imageFileNameString.split(dot).pop(); // https://stackoverflow.com/a/1203361/470749
  const contentType = extension === svg ? 'image/svg+xml' : imagePng;
  const bufferType: BufferTypeDef = extension === svg ? undefined : imagePng;
  const canvasType: CanvasTypeDef = extension === svg ? svg : undefined;
  const lastIndex = imageFileNameString.lastIndexOf(`${dot}${extension}`); // https://stackoverflow.com/a/9323226/470749
  const hash = imageFileNameString.substring(0, lastIndex);
  return { extension, bufferType, contentType, canvasType, hash };
}

async function generateImage(canvasType: CanvasTypeDef, bufferType: BufferTypeDef, hash: string) {
  // TODO: Change the design and content of this image.

  // Define the canvas
  const width = 200; // width of the image
  const height = 100; // height of the image
  const canvas = createCanvas(width, height, canvasType);
  const context = canvas.getContext('2d');

  // Define the font style
  context.textAlign = 'center';
  context.textBaseline = 'top';
  context.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // https://css-tricks.com/snippets/javascript/random-hex-color/
  context.font = `40px '${fontFamily}' bold`;

  // Load and draw the background image first
  const image = await loadImage(certificateBackgroundImage);

  // Draw the background
  context.drawImage(image, 0, 0, width, height);

  // Draw the text
  context.fillText(hash, width / 2, height / 2);

  // Convert the Canvas to a buffer
  const buffer = bufferType ? canvas.toBuffer(bufferType) : canvas.toBuffer();
  return buffer;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer>) {
  // Grab payload from query.
  const { imageFileName } = req.query;

  const imageFileNameString = getSimpleStringFromParam(imageFileName);
  const { bufferType, contentType, canvasType, hash } = parseFileName(imageFileNameString);

  // TODO: Using this hash, fetch other text (mainnet address, date, program name, and competencies from NFT metadata) that will be added to the certificate image, and
  // provide each piece of text to generateImage.
  const imageBuffer = await generateImage(canvasType, bufferType, hash);
  res.setHeader('Content-Type', contentType);
  // TODO: cache
  res.send(imageBuffer);
}
