// functions/user.js
const { handler } = require('../dist/main'); // Asegúrate de que esta ruta sea correcta

module.exports.handler = async (event, context) => {
  try {
    const result = await handler(event, context);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
