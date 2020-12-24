import { CanvasPainter, ContainerView, TextView, ImageView } from "./Util/index.js";

const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 480;

export default function main(){
	const rootContainer = new ContainerView(0, 0, 640, 480);
	rootContainer.setBackgroundColor("#f00");
	const buttonContainer = new ContainerView(32, 32, 64, 64);
	buttonContainer.setBackgroundColor("#0f0");
	rootContainer.appendChild(buttonContainer);

	let canvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;
	canvasElement.width = WINDOW_WIDTH;
	canvasElement.height = WINDOW_HEIGHT;
	const painter = new CanvasPainter(canvasElement);
	rootContainer.draw(painter);
}