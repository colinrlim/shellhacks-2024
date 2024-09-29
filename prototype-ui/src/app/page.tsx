'use client';

import React, { useRef, useState } from 'react';
import { UIManager } from '@/lib/UIManager';
import { UITextLabel, UITextbox, UIFrame, UIButton } from '@/lib/UIObjectTypes';
import { renderManager, renderInitialize } from '@/lib/renderer';

let totalQuestions: number = 0;

interface Question_T {
  question: string;
  choice_1: string;
  choice_2: string;
  choice_3: string;
  choice_4: string;
  correct_choice: number;
}

export default function Home() {
  const managerRef = useRef<UIManager>(new UIManager());
  const manager = managerRef.current;
  const [userInput, setUserInput] = useState('');

  renderInitialize(manager, (manager: UIManager) => {
    const textbox = new UITextbox({
      id: 'textbox',
      startX: 1920/2-500,
      startY: 60,
      endX: 1920/2-500,
      endY: 400,
      width: 1000,
      height: 60,
      startOpacity: 0,
      endOpacity: 1,
      duration: 2,
      easingStyle: 'Quint',
      easingDirection: 'Out',
      isVisible: true,
      fillColor: 'rgb(240,240,240)',
      outlineColor: 'rgb(235,235,235)',
      outlineSize: 5,
      borderRadius: 5,
      text: "",
      fontColor: 'black',
      fontSize: 25,
      fontWeight: 'bold',
      textAlign: 'center',
      placeholderText: "Enter a topic for your quiz",
      padding: 5,
      onEnter: handleEnter
    });

    const textLabel = new UITextLabel({
      id: 'text-label',
      startX: 1920/2-500,
      startY: 50,
      endX: 1920/2-500,
      endY: 310,
      width: 1000,
      height: 100,
      startOpacity: 0,
      endOpacity: 1,
      duration: 2,
      easingStyle: 'Quint',
      easingDirection: 'Out',
      isVisible: true,
      fillColor: 'transparent',
      outlineColor: 'transparent',
      outlineSize: 2,
      borderRadius: 5,
      text: 'What would you like to be quizzed on?',
      fontColor: 'rgb(90,90,90)',
      fontSize: 50,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 0
    });

    manager.addObject(textbox);
    manager.addObject(textLabel);
  });

  const handleEnter = (value: string) => {
    setUserInput(value);
    tweenAwayElements();
  };

  const tweenAwayElements = () => {
    const textbox = manager.objects.find(obj => obj.id === 'textbox') as UITextbox;
    const textLabel = manager.objects.find(obj => obj.id === 'text-label') as UITextLabel;

    if (textbox && textLabel) {
      textbox.startY = textbox.currentY;
      textbox.endY = -100;
      textbox.startOpacity = textbox.currentOpacity;
      textbox.endOpacity = 0;
      textbox.duration = 1;
      textbox.easingStyle = 'Quint';
      textbox.easingDirection = 'In';
      textbox.reset();

      textLabel.startY = textLabel.currentY;
      textLabel.endY = -100;
      textLabel.startOpacity = textLabel.currentOpacity;
      textLabel.endOpacity = 0;
      textLabel.duration = 1;
      textLabel.easingStyle = 'Quint';
      textLabel.easingDirection = 'In';
      textLabel.reset();

      setTimeout(() => {
        textbox.isVisible = false;
        textLabel.isVisible = false;
      }, 1000);
    }
  };

  function spawnQuestion(question: Question_T): void {
    const cardHeight = 400;
    const cardWidth = 800;
    const startY = 100 + totalQuestions * (cardHeight + 20);
    const endY = startY;

    const frameCard = new UIFrame({
      id: `question-card-${totalQuestions}`,
      startX: 1920/2 - cardWidth/2,
      startY: startY + 100,
      endX: 1920/2 - cardWidth/2,
      endY: endY,
      width: cardWidth,
      height: cardHeight,
      startOpacity: 0,
      endOpacity: 1,
      duration: 1.5,
      easingStyle: 'Quint',
      easingDirection: 'Out',
      isVisible: true,
      fillColor: 'rgb(255,255,255)',
      outlineColor: 'rgb(200,200,200)',
      outlineSize: 2,
      borderRadius: 10,
      padding: 20,
      children: []
    });

    const questionText = new UITextLabel({
      id: `question-text-${totalQuestions}`,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      width: cardWidth - 40,
      height: 120,
      startOpacity: 1,
      endOpacity: 1,
      duration: 0,
      easingStyle: 'Linear',
      easingDirection: 'In',
      isVisible: true,
      fillColor: 'transparent',
      outlineColor: 'transparent',
      outlineSize: 0,
      borderRadius: 0,
      text: question.question,
      fontColor: 'rgb(50,50,50)',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'left',
      padding: 20
    });

    frameCard.addChild(questionText);

    const choices = [question.choice_1, question.choice_2, question.choice_3, question.choice_4];
    choices.forEach((choice, index) => {
      const button = new UIButton({
        id: `choice-${totalQuestions}-${index + 1}`,
        startX: 20,
        startY: 140 + index * 50,
        endX: 20,
        endY: 140 + index * 50,
        width: cardWidth - 80,
        height: 40,
        startOpacity: 1,
        endOpacity: 1,
        duration: 0,
        easingStyle: 'Linear',
        easingDirection: 'In',
        isVisible: true,
        fillColor: 'rgb(240,240,240)',
        outlineColor: 'rgb(200,200,200)',
        outlineSize: 1,
        borderRadius: 5,
        text: "​     " + choice,
        padding: 0,
        fontColor: "black",
        onClick: () => console.log(`Selected choice ${index + 1}`)
      });
      frameCard.addChild(button);
    });

    manager.addObject(frameCard);
    totalQuestions++;
  }

  // Example usage of spawnQuestion (you can remove this in production)
  React.useEffect(() => {
    const exampleQuestion: Question_T = {
      question: "What is the capital of France?",
      choice_1: "London",
      choice_2: "Berlin",
      choice_3: "Paris",
      choice_4: "Madrid",
      correct_choice: 3
    };
    setTimeout(() => spawnQuestion(exampleQuestion), 3000); // Spawn after 3 seconds
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: 'white' }}>
      <h1 style={{ textAlign: 'center' }}>Interactive Quiz</h1>
      {renderManager(manager)}
    </div>
  );
}