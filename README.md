# Motion and facial intelligence bot

This app does posture detection and facial recognition

## Instructions
1. git clone git@192.168.1.219:woonzh/complete-motion-and-facial-intelligence.git
2. cd complete-motion-and-facial-intelligence
3. docker image build -t face_reg_ui ./facepose-demos
4. docker image build -t face_reg ./server
5. docker-compose up

6. Run docker-compose down to stop container

