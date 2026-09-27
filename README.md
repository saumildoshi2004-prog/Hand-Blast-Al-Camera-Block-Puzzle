# HAND BLAST — complete camera-controlled prototype

This is a mouse-free Block Blast-style web game.

Features:
- 8x8 board
- 21 block shapes
- Includes 2x2 and 3x3
- 10-color palette
- Camera permission gate
- MediaPipe hand tracking
- Index-finger virtual cursor
- Pinch to pick and release to place
- Row and column clearing
- Blast flash + particles
- Score + persistent best score via localStorage
- Game-over screen
- Mobile and laptop responsive UI
- No mouse/keyboard controls are required

## Run
Because camera access generally requires a secure context, use HTTPS or localhost.

Easy option:
1. Extract ZIP.
2. Open the folder in VS Code.
3. Run with a local server such as VS Code Live Server.
4. Open the HTTPS/localhost page.
5. Tap ENABLE CAMERA.
6. Show one hand to the camera.
7. Move index finger over a piece.
8. Pinch index finger + thumb to pick it.
9. Keep pinching and move to the board.
10. Release pinch to place.

Internet is required for the MediaPipe JS package/model CDN in this version.
