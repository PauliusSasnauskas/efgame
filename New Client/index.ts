import App from "./App";
import MainScreen from "./Window/Screen/MainScreen";

export default function main(){
	App.init(640, 480,
		document.getElementById("gameCanvas") as HTMLCanvasElement,
		MainScreen
	);
}