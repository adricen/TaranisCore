import { BaseApp } from 'core/BaseApp';

const canvas = document.getElementById('appCanvas');
const app = new (class extends BaseApp {})(canvas as HTMLCanvasElement);

app.start();
