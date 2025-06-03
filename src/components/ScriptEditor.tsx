import React, { useState, useEffect } from 'react';
import { Save, Download, Plus, Trash2, Moon, Sun, RefreshCcw, Sparkles, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

interface ScriptElement {
  id: string;
  type: 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
  content: string;
  character?: string;
}

interface Scene {
  id: string;
  title: string;
  elements: ScriptElement[];
  timestamp: string;
}

const ScriptEditor = () => {
  const [currentScene, setCurrentScene] = useState<Scene>({
    id: '1',
    title: 'New Scene',
    elements: [],
    timestamp: new Date().toISOString()
  });
  
  const [savedScenes, setSavedScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<string[]>(['JOHN', 'JANE', 'NARRATOR']);
  const [newCharacter, setNewCharacter] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Scene heading dropdown states
  const [selectedSceneType, setSelectedSceneType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('');
  
  const sceneTypes = ['INT.', 'EXT.'];
  const locations = ['LIVING ROOM', 'KITCHEN', 'BEDROOM', 'OFFICE', 'STREET', 'PARK', 'CAR', 'HALLWAY', 'ALLEYWAY', 'BATHROOM', 'RESTAURANT', 'HOSPITAL', 'SCHOOL', 'WAREHOUSE'];
  const timeOfDay = ['DAY', 'NIGHT', 'MORNING', 'EVENING', 'CONTINUOUS'];

  // Load scenes from localStorage on component mount
  useEffect(() => {
    const savedScenesData = localStorage.getItem('scriptEditor_scenes');
    if (savedScenesData) {
      try {
        const parsedScenes = JSON.parse(savedScenesData);
        setSavedScenes(parsedScenes);
      } catch (error) {
        console.error('Error loading saved scenes:', error);
      }
    }

    const savedCharacters = localStorage.getItem('scriptEditor_characters');
    if (savedCharacters) {
      try {
        const parsedCharacters = JSON.parse(savedCharacters);
        setCharacters(parsedCharacters);
      } catch (error) {
        console.error('Error loading saved characters:', error);
      }
    }

    const savedTheme = localStorage.getItem('scriptEditor_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save scenes to localStorage whenever savedScenes changes
  useEffect(() => {
    if (savedScenes.length > 0) {
      localStorage.setItem('scriptEditor_scenes', JSON.stringify(savedScenes));
    }
  }, [savedScenes]);

  // Save characters to localStorage whenever characters changes
  useEffect(() => {
    localStorage.setItem('scriptEditor_characters', JSON.stringify(characters));
  }, [characters]);

  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('scriptEditor_apiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('scriptEditor_apiKey', apiKey);
    }
  }, [apiKey]);

  const getSceneHeadingSuggestions = (input: string) => {
    const upperInput = input.toUpperCase();
    const suggestions = [];
    
    // Check for scene type matches
    const matchingTypes = sceneTypes.filter(type => type.startsWith(upperInput));
    
    // Check for location matches
    const matchingLocations = locations.filter(location => location.includes(upperInput));
    
    // Combine suggestions
    if (matchingTypes.length > 0) {
      matchingLocations.forEach(location => {
        matchingTypes.forEach(type => {
          suggestions.push(`${type} ${location} - DAY`);
          suggestions.push(`${type} ${location} - NIGHT`);
        });
      });
    } else if (upperInput.startsWith('INT.') || upperInput.startsWith('EXT.')) {
      const typePrefix = upperInput.startsWith('INT.') ? 'INT.' : 'EXT.';
      const locationPart = upperInput.replace(typePrefix, '').trim();
      
      if (locationPart) {
        const filteredLocations = locations.filter(location => 
          location.includes(locationPart)
        );
        filteredLocations.forEach(location => {
          suggestions.push(`${typePrefix} ${location} - DAY`);
          suggestions.push(`${typePrefix} ${location} - NIGHT`);
        });
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scriptEditor_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scriptEditor_theme', 'light');
    }
  };

  const addElement = (type: ScriptElement['type']) => {
    const newElement: ScriptElement = {
      id: Date.now().toString(),
      type,
      content: '',
      character: type === 'dialogue' || type === 'parenthetical' ? characters[0] : undefined
    };
    
    setCurrentScene(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const updateElement = (id: string, content: string, character?: string) => {
    setCurrentScene(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, content, character } : el
      )
    }));
  };

  const deleteElement = (id: string) => {
    setCurrentScene(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
  };

  const saveScene = () => {
    const sceneToSave = {
      ...currentScene,
      timestamp: new Date().toISOString()
    };
    
    setSavedScenes(prev => {
      const existingIndex = prev.findIndex(scene => scene.id === currentScene.id);
      if (existingIndex >= 0) {
        return prev.map((scene, index) => index === existingIndex ? sceneToSave : scene);
      }
      return [...prev, sceneToSave];
    });
  };

  const loadScene = (scene: Scene) => {
    setCurrentScene(scene);
  };

  const newScene = () => {
    setCurrentScene({
      id: Date.now().toString(),
      title: 'New Scene',
      elements: [],
      timestamp: new Date().toISOString()
    });
  };

  const refreshScene = () => {
    setCurrentScene({
      id: Date.now().toString(),
      title: 'New Scene',
      elements: [],
      timestamp: new Date().toISOString()
    });
  };

  const addCharacter = () => {
    if (newCharacter.trim() && !characters.includes(newCharacter.toUpperCase())) {
      setCharacters(prev => [...prev, newCharacter.toUpperCase()]);
      setNewCharacter('');
    }
  };

  const exportScript = () => {
    let scriptContent = `TITLE: ${currentScene.title}\n\n`;
    
    currentScene.elements.forEach(element => {
      switch (element.type) {
        case 'scene':
          scriptContent += `${element.content}\n\n`;
          break;
        case 'action':
          scriptContent += `${element.content}\n\n`;
          break;
        case 'character':
          scriptContent += `                    ${element.content}\n`;
          break;
        case 'dialogue':
          scriptContent += `          ${element.content}\n\n`;
          break;
        case 'parenthetical':
          scriptContent += `                    (${element.content})\n`;
          break;
        case 'transition':
          scriptContent += `                                        ${element.content}\n\n`;
          break;
      }
    });

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScene.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getElementStyle = (type: string) => {
    switch (type) {
      case 'scene':
        return 'font-bold text-left uppercase tracking-wide';
      case 'action':
        return 'text-left';
      case 'character':
        return 'text-center font-semibold uppercase tracking-wider';
      case 'dialogue':
        return 'text-left ml-20 mr-20';
      case 'parenthetical':
        return 'text-center italic ml-16 mr-16';
      case 'transition':
        return 'text-right font-semibold uppercase';
      default:
        return '';
    }
  };

  const deleteCharacter = (characterToDelete: string) => {
    setCharacters(prev => prev.filter(char => char !== characterToDelete));
    
    // Update any elements that were using this character
    setCurrentScene(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.character === characterToDelete 
          ? { ...el, character: characters.filter(char => char !== characterToDelete)[0] || '' }
          : el
      )
    }));
  };

  const addSceneHeading = () => {
    let sceneHeadingContent = '';
    
    // Build scene heading from selected dropdown values
    if (selectedSceneType && selectedLocation && selectedTimeOfDay) {
      sceneHeadingContent = `${selectedSceneType} ${selectedLocation} - ${selectedTimeOfDay}`;
    } else if (selectedSceneType && selectedLocation) {
      sceneHeadingContent = `${selectedSceneType} ${selectedLocation} - DAY`;
    } else if (selectedSceneType) {
      sceneHeadingContent = `${selectedSceneType} LOCATION - DAY`;
    } else {
      sceneHeadingContent = 'INT. LOCATION - DAY';
    }
    
    const newElement: ScriptElement = {
      id: Date.now().toString(),
      type: 'scene',
      content: sceneHeadingContent,
    };
    
    setCurrentScene(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    
    // Reset dropdown selections after adding
    setSelectedSceneType('');
    setSelectedLocation('');
    setSelectedTimeOfDay('');
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIScript = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate a random story prompt
      const genres = ['drama', 'comedy', 'thriller', 'romance', 'sci-fi', 'mystery'];
      const settings = ['coffee shop', 'hospital', 'office building', 'park', 'apartment', 'school', 'restaurant', 'library'];
      const conflicts = ['unexpected meeting', 'difficult decision', 'hidden secret revealed', 'misunderstanding', 'life-changing news', 'reunion'];
      
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      const randomSetting = settings[Math.floor(Math.random() * settings.length)];
      const randomConflict = conflicts[Math.floor(Math.random() * conflicts.length)];
      
      const prompt = `Write a short ${randomGenre} script scene set in a ${randomSetting} involving ${randomConflict}. Include scene heading, action lines, character names, and dialogue. Keep it under 300 words.`;

      // Use OpenAI API to generate the script
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional screenwriter. Generate a properly formatted script with clear scene headings (INT./EXT. LOCATION - TIME), action lines, character names in caps, and dialogue. Keep it concise and engaging.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      const generatedScript = data.choices[0].message.content;

      // Parse the generated script into elements
      const lines = generatedScript.split('\n').filter(line => line.trim());
      const scriptElements: ScriptElement[] = [];
      const newCharacters = new Set<string>();

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        let elementType: ScriptElement['type'] = 'action';
        let content = trimmedLine;
        let character: string | undefined;

        // Detect scene headings
        if (trimmedLine.match(/^(INT\.|EXT\.)/i)) {
          elementType = 'scene';
        }
        // Detect character names (all caps, centered)
        else if (trimmedLine.match(/^[A-Z][A-Z\s]+$/) && trimmedLine.length < 30) {
          elementType = 'character';
          newCharacters.add(trimmedLine);
        }
        // Detect dialogue (follows character)
        else if (scriptElements.length > 0 && scriptElements[scriptElements.length - 1].type === 'character') {
          elementType = 'dialogue';
          character = scriptElements[scriptElements.length - 1].content;
        }
        // Detect parentheticals
        else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
          elementType = 'parenthetical';
          content = trimmedLine.slice(1, -1);
          if (scriptElements.length > 0) {
            const lastCharacterElement = [...scriptElements].reverse().find(el => el.type === 'character');
            character = lastCharacterElement?.content;
          }
        }
        // Detect transitions
        else if (trimmedLine.match(/(FADE IN|FADE OUT|CUT TO|DISSOLVE TO):/i)) {
          elementType = 'transition';
        }

        scriptElements.push({
          id: (Date.now() + index).toString(),
          type: elementType,
          content,
          character
        });
      });

      // Add new characters to the character list
      setCharacters(prev => {
        const updated = [...prev];
        newCharacters.forEach(char => {
          if (!updated.includes(char)) {
            updated.push(char);
          }
        });
        return updated;
      });

      // Update the current scene
      setCurrentScene(prev => ({
        ...prev,
        title: `AI Generated ${randomGenre.charAt(0).toUpperCase() + randomGenre.slice(1)} Scene`,
        elements: scriptElements
      }));

    } catch (error) {
      console.error('Error generating script:', error);
      // Fallback to sample script if API fails
      const sampleScriptElements: ScriptElement[] = [
        {
          id: Date.now().toString(),
          type: 'scene',
          content: 'INT. COFFEE SHOP - DAY'
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'action',
          content: 'A bustling coffee shop filled with the aroma of freshly brewed coffee. SARAH, a young writer in her late twenties, sits at a corner table with her laptop open, typing furiously.'
        },
        {
          id: (Date.now() + 2).toString(),
          type: 'character',
          content: 'SARAH'
        },
        {
          id: (Date.now() + 3).toString(),
          type: 'dialogue',
          content: 'I need more inspiration for this story.',
          character: 'SARAH'
        }
      ];

      setCharacters(prev => {
        const newChars = [...prev];
        if (!newChars.includes('SARAH')) newChars.push('SARAH');
        return newChars;
      });

      setCurrentScene(prev => ({
        ...prev,
        title: 'Sample Coffee Shop Scene',
        elements: sampleScriptElements
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col lg:flex-row transition-colors">
      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              Enter OpenAI API Key
            </h3>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowApiKeyInput(false)} disabled={!apiKey.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Navigation */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              Scenes
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Saved Scenes</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              <Button onClick={newScene} size="sm" variant="outline" className="w-full mb-4">
                <Plus className="w-4 h-4 mr-2" />
                New Scene
              </Button>
              {savedScenes.map((scene) => (
                <Card 
                  key={scene.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-700 dark:border-slate-600"
                  onClick={() => loadScene(scene)}
                >
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                      {scene.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(scene.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {scene.elements.length} elements
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              Tools
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick Tools</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6 max-h-80 overflow-y-auto">
              {/* Characters */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Characters</h3>
                <div className="space-y-2">
                  {characters.map((char) => (
                    <div key={char} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                      <span>{char}</span>
                      <Button
                        onClick={() => deleteCharacter(char)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-1">
                    <Input
                      value={newCharacter}
                      onChange={(e) => setNewCharacter(e.target.value)}
                      placeholder="Add character"
                      className="text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                      onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                    />
                    <Button onClick={addCharacter} size="sm" variant="outline">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scene Types */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Scene Headings</h3>
                <div className="space-y-2">
                  <Select value={selectedSceneType} onValueChange={setSelectedSceneType}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Interior/Exterior" />
                    </SelectTrigger>
                    <SelectContent>
                      {sceneTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTimeOfDay} onValueChange={setSelectedTimeOfDay}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Time of Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOfDay.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={addSceneHeading} variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Scene Heading
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button onClick={saveScene} variant="outline" size="sm" className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Scene
                  </Button>
                  <Button onClick={exportScript} variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Script
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Left Sidebar - Saved Scenes */}
      <div className="hidden lg:block w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Scenes</h2>
          <Button onClick={newScene} size="sm" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {savedScenes.map((scene) => (
            <Card 
              key={scene.id} 
              className="cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-700 dark:border-slate-600"
              onClick={() => loadScene(scene)}
            >
              <CardContent className="p-3">
                <h3 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                  {scene.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(scene.timestamp).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {scene.elements.length} elements
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Sticky Header with AI Generator, API Key, Refresh and Theme Toggle */}
          <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 pb-4 mb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  onClick={refreshScene}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  onClick={generateAIScript}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-none hover:from-purple-600 hover:to-blue-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">AI Script</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowApiKeyInput(true)}
                  variant="outline"
                  size="sm"
                  title="Set OpenAI API Key"
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 mx-2">
                <Input
                  value={currentScene.title}
                  onChange={(e) => setCurrentScene(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl lg:text-2xl font-bold border-none text-center text-slate-800 dark:text-slate-200 bg-transparent"
                  placeholder="Scene Title"
                />
              </div>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="ml-2 lg:ml-4 hidden lg:flex"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
            <Separator className="mt-4" />
          </div>

          {/* Sticky Action Buttons */}
          <div className="sticky top-20 z-10 bg-slate-50 dark:bg-slate-900 pb-4 mb-6">
            <div className="flex flex-wrap justify-center gap-1 lg:gap-2">
              <Button onClick={() => addElement('scene')} variant="outline" size="sm" className="text-xs lg:text-sm">
                Scene Heading
              </Button>
              <Button onClick={() => addElement('action')} variant="outline" size="sm" className="text-xs lg:text-sm">
                Action
              </Button>
              <Button onClick={() => addElement('character')} variant="outline" size="sm" className="text-xs lg:text-sm">
                Character
              </Button>
              <Button onClick={() => addElement('dialogue')} variant="outline" size="sm" className="text-xs lg:text-sm">
                Dialogue
              </Button>
              <Button onClick={() => addElement('parenthetical')} variant="outline" size="sm" className="text-xs lg:text-sm">
                Parenthetical
              </Button>
              <Button onClick={() => addElement('transition')} variant="outline" size="sm" className="text-xs lg:text-sm">
                Transition
              </Button>
              <Separator orientation="vertical" className="h-8 hidden lg:block" />
              <Button onClick={saveScene} variant="default" size="sm" className="text-xs lg:text-sm">
                <Save className="w-4 h-4 mr-1 lg:mr-2" />
                Save
              </Button>
              <Button onClick={exportScript} variant="default" size="sm" className="text-xs lg:text-sm">
                <Download className="w-4 h-4 mr-1 lg:mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Script Elements */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:p-8 min-h-96">
            <div className="space-y-4">
              {currentScene.elements.map((element) => (
                <div key={element.id} className="group relative">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      {(element.type === 'dialogue' || element.type === 'parenthetical') ? (
                        <div className="space-y-2">
                          <Select
                            value={element.character}
                            onValueChange={(value) => updateElement(element.id, element.content, value)}
                          >
                            <SelectTrigger className="w-48 mx-auto">
                              <SelectValue placeholder="Select character" />
                            </SelectTrigger>
                            <SelectContent>
                              {characters.map((char) => (
                                <SelectItem key={char} value={char}>{char}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={element.content}
                            onChange={(e) => updateElement(element.id, e.target.value, element.character)}
                            className={`border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 resize-none ${getElementStyle(element.type)}`}
                            placeholder={`Enter ${element.type}...`}
                            rows={3}
                          />
                        </div>
                      ) : element.type === 'scene' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={element.content}
                            onChange={(e) => updateElement(element.id, e.target.value)}
                            className={`border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 resize-none ${getElementStyle(element.type)}`}
                            placeholder="Enter scene heading (e.g., INT. LIVING ROOM - DAY)..."
                            rows={1}
                          />
                          {element.content && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              <p>Suggestions:</p>
                              <div className="space-y-1 mt-1">
                                {getSceneHeadingSuggestions(element.content).map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => updateElement(element.id, suggestion)}
                                    className="block text-left w-full px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-xs"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Textarea
                          value={element.content}
                          onChange={(e) => updateElement(element.id, e.target.value)}
                          className={`border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 resize-none ${getElementStyle(element.type)}`}
                          placeholder={`Enter ${element.type}...`}
                          rows={element.type === 'character' ? 1 : 3}
                        />
                      )}
                    </div>
                    <Button
                      onClick={() => deleteElement(element.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {currentScene.elements.length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 py-12">
                  <p>Start writing your script by adding elements above or try the AI Script Generator</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Right Sidebar - Quick Tools */}
      <div className="hidden lg:block w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-6">
          {/* Characters */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Characters</h3>
            <div className="space-y-2">
              {characters.map((char) => (
                <div key={char} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                  <span>{char}</span>
                  <Button
                    onClick={() => deleteCharacter(char)}
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-1">
                <Input
                  value={newCharacter}
                  onChange={(e) => setNewCharacter(e.target.value)}
                  placeholder="Add character"
                  className="text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                />
                <Button onClick={addCharacter} size="sm" variant="outline">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scene Types */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Scene Headings</h3>
            <div className="space-y-2">
              <Select value={selectedSceneType} onValueChange={setSelectedSceneType}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Interior/Exterior" />
                </SelectTrigger>
                <SelectContent>
                  {sceneTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTimeOfDay} onValueChange={setSelectedTimeOfDay}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Time of Day" />
                </SelectTrigger>
                <SelectContent>
                  {timeOfDay.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={addSceneHeading} variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Scene Heading
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button onClick={saveScene} variant="outline" size="sm" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Scene
              </Button>
              <Button onClick={exportScript} variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Script
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
