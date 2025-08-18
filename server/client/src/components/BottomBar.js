import React from 'react';
import './BottomBar.css';

function BottomBar() {
  return (
    <footer className="bottom-bar">
      <div className="bottom-bar-text">
        <p>
          Wizards of the Coast, Magic: The Gathering, and their logos are trademarks of Wizards of the Coast LLC in the United States and other countries. © 1993-2025 Wizards. All Rights Reserved.
        </p>
        <p>
          CounterTop is not affiliated with, endorsed, sponsored, or specifically approved by Wizards of the Coast LLC. We may use the trademarks and other intellectual property of Wizards of the Coast LLC, which is permitted under Wizards' Fan Site Policy. MAGIC: THE GATHERING® is a trademark of Wizards of the Coast. For more information about Wizards of the Coast or any of Wizards' trademarks or other intellectual property, please visit their website at <a href="https://company.wizards.com/" target="_blank" rel="noopener noreferrer">https://company.wizards.com/</a>.
        </p>
        <p>
          Some card prices and other card data are provided by Scryfall. Scryfall makes no guarantee about its price information and recommends you see stores for final prices and details.
        </p>
        <p className="bottom-bar-creator">@ 2025 - by Oliver Lee.</p>
      </div>
    </footer>
  );
}

export default BottomBar; 