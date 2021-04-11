
/**
 * Refering to this document: https://stackoverflow.com/questions/32192064/does-react-native-have-global-scope-if-not-how-can-i-mimic-it
 * We can integrate any nodejs constants or libraries with 2 steps.
 * Step 1: Add alternate library like Buffer in package.json
 * Step 2: Require library and put in global scope with correct identifier.
 */
global.Buffer = require('buffer').Buffer;
