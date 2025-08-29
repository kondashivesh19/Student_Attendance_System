
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, User, MapPin, Clock, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Overview from "@/components/Dashboard/Overview";
import LocationMonitor from "@/components/Dashboard/LocationMonitor";
import StudentLog from "@/components/Dashboard/StudentLog";
import CameraControl from "@/components/Dashboard/CameraControl";

// API base URL - change this to match your Flask server
const API_BASE_URL = "http://localhost:5000/api";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFaceCollectionDialog, setShowFaceCollectionDialog] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const { toast } = useToast();
  
  const handleCollectFaces = () => {
    setShowFaceCollectionDialog(true);
  };
  
  const submitFaceCollection = async () => {
    if (!studentId || !studentName) {
      toast({
        title: "Missing Information",
        description: "Please provide both student ID and name",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setShowFaceCollectionDialog(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/collect-faces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId: studentId,
          personName: studentName,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Face Collection Started",
          description: data.message,
        });
      } else {
        throw new Error(data.message || "Failed to start face collection");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrainModel = async () => {
    setIsProcessing(true);
    toast({
      title: "Training Started",
      description: "Model training has begun. This may take a few minutes.",
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/train-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Training Complete",
          description: "Face recognition model has been trained successfully.",
        });
      } else {
        throw new Error(data.message || "Failed to train model");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Training failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRecognition = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/start-recognition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: 'Main Entrance'  // You might want to make this dynamic
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Recognition Started",
          description: "Face recognition system is now active.",
        });
      } else {
        throw new Error(data.message || "Failed to start recognition");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to start recognition",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Student Tracking System</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor student presence across campus locations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleCollectFaces} 
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="mr-2 h-4 w-4" />
              Collect Faces
            </Button>
            <Button 
              onClick={handleTrainModel} 
              disabled={isProcessing}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Clock className="mr-2 h-4 w-4" />
              Train Model
            </Button>
            <Button 
              onClick={handleStartRecognition} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Recognition
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="logs">Student Logs</TabsTrigger>
            <TabsTrigger value="camera">Camera Control</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview />
          </TabsContent>
          <TabsContent value="locations">
            <LocationMonitor />
          </TabsContent>
          <TabsContent value="logs">
            <StudentLog />
          </TabsContent>
          <TabsContent value="camera">
            <CameraControl />
          </TabsContent>
        </Tabs>
      </main>

      {/* Face Collection Dialog */}
      <Dialog open={showFaceCollectionDialog} onOpenChange={setShowFaceCollectionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Collect Student Face Data</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student ID
              </Label>
              <Input 
                id="studentId" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
                className="col-span-3"
                placeholder="S001" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                value={studentName} 
                onChange={(e) => setStudentName(e.target.value)} 
                className="col-span-3"
                placeholder="John Smith" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowFaceCollectionDialog(false)}>Cancel</Button>
            <Button type="button" onClick={submitFaceCollection} disabled={isProcessing}>
              Start Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
