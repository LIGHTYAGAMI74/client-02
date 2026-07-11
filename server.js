import app from './api/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🚀 Fulfilling Vaibhavi's Wardrobe Backend on port ${PORT}!`);
  console.log(`Connected API server: http://localhost:${PORT}\n`);
});
