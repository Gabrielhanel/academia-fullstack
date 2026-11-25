import react from '@vitejs/plugin-react'; import { visualizer } from 'rollup-plugin-visualizer';
export default { plugins: [react(), visualizer({ filename: 'stats.html', template: 'raw-data' })], build: { reportCompressedSize: true } };
