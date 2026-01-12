import React, { useState } from 'react';
import { mockData } from '../mock';
import { Play, Clock, Calendar, Radio } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const RadioShows = () => {
  const { radioShows } = mockData;
  const [playingVideo, setPlayingVideo] = useState(null);

  return (
    <section id="radio" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7B3B3B' }}>
            Radio Highlights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch snippets from recent radio appearances where faith meets real life
          </p>
          <p className="text-lg text-gray-700 mt-4 font-medium">
            <Radio className="w-5 h-5 inline-block mr-2" style={{ color: '#7B3B3B' }} />
            Tune in every Saturday from 11am-1pm EST on Bobo FM 103.1
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {radioShows.map((show, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative aspect-video bg-gray-900">
                {playingVideo === index ? (
                  <iframe
                    className="w-full h-full"
                    src={show.videoUrl}
                    title={show.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${mockData.gallery[index % mockData.gallery.length]})`,
                        filter: 'brightness(0.6)'
                      }}
                    ></div>
                    <button
                      onClick={() => setPlayingVideo(index)}
                      className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:opacity-90"
                      style={{ backgroundColor: '#7B3B3B' }}
                    >
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>
                  {show.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {show.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{show.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{show.date}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Listen Live CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.bobofm.ky"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              style={{ backgroundColor: '#7B3B3B' }}
              className="hover:opacity-90 transition-opacity duration-200 text-lg px-8 py-6"
              data-testid="listen-live-cta"
            >
              <Radio className="w-5 h-5 mr-2" />
              Listen Live on Bobo FM
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default RadioShows;
