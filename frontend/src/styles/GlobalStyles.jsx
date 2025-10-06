import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
 html, body, #root{
    min-height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    box-sizing: border-box;
  background: linear-gradient(to bottom, #b3e0ff, #f5f5f5);
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default GlobalStyles;