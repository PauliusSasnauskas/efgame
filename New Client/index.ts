import ButtonView from "./Util/ButtonView";
import { CanvasPainter, ContainerView, TextView, ImageView } from "./Util/index";

const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 480;

export default function main(){
	const rootContainer = new ContainerView(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
	rootContainer.setBackgroundColor("#c53");
	const button1 = new ButtonView(32, 224, 192, 32, "Play", 5);
	button1.setBackgroundColor("#333");
	button1.setOnClick(()=>{
		console.log("OK");
	});
	rootContainer.appendChild(button1);
	const titleText = new TextView(32, 192, "EFGame");
	titleText.setFontSize(32);
	rootContainer.appendChild(titleText);

	const canvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;
	canvasElement.width = WINDOW_WIDTH;
	canvasElement.height = WINDOW_HEIGHT;
	const painter = new CanvasPainter(canvasElement);
	rootContainer.draw(painter);
}