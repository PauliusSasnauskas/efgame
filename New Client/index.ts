import { CanvasPainter } from "./Window/Component/index";
import App from "./App";
import LoadScreen from "./Window/Screen/Game/LoadScreen";

export default function main(windowWidth : number, windowHeight : number){
	const canvasElement = document.getElementById("gameCanvas") as HTMLCanvasElement;
	canvasElement.width = windowWidth;
	canvasElement.height = windowHeight;
	
	App.init(windowWidth, windowHeight,
		new CanvasPainter(canvasElement),
		LoadScreen
	);
}