import React, { useState, useEffect, useMemo } from 'react';
import { getNotificationsForRole } from '../src/data/notificationsData.js';

console.log('Testing Object identity:');
const obj1 = JSON.parse('{"id":"demo"}');
const obj2 = JSON.parse('{"id":"demo"}');
console.log('obj1 === obj2:', obj1 === obj2); // false

// Test whether getNotificationsForRole with same user returns new array
const n1 = getNotificationsForRole('student', obj1);
const n2 = getNotificationsForRole('student', obj1);
console.log('n1 === n2:', n1 === n2); // false, always creates new array reference
console.log('Lengths:', n1.length, n2.length);
