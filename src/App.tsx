import React, { useState } from 'react';
import { Search, BookMarked, TrendingUp, Brain, Notebook as Robot, Database, Radio, Presentation as PresentationChart, ExternalLink, MessageSquare, ArrowBigUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface TechCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  subreddits: string[];
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  permalink: string;
  url: string;
  created_utc: number;
  subreddit: string;
  ups: number;
  num_comments: number;
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const categories: TechCategory[] = [
    {
      id: 'ai',
      name: 'Intelligence Artificielle',
      nameEn: 'Artificial Intelligence',
      icon: <Brain className="w-6 h-6" />,
      subreddits: [
        'artificial',
        'MachineLearning',
        'deeplearning',
        'mlscaling',
        'AINews',
        'GPT3',
        'OpenAI',
        'computervision',
        'LanguageTechnology',
        'reinforcementlearning'
      ]
    },
    {
      id: 'robotics',
      name: 'Robotique',
      nameEn: 'Robotics',
      icon: <Robot className="w-6 h-6" />,
      subreddits: [
        'robotics',
        'Automate',
        'ROS',
        'IndustrialAutomation',
        'roboticengineering',
        'cobotics',
        'drones',
        'autonomous',
        'manufacturing'
      ]
    },
    {
      id: 'iot',
      name: 'Internet des Objets',
      nameEn: 'Internet of Things',
      icon: <Radio className="w-6 h-6" />,
      subreddits: [
        'IOT',
        'InternetOfThings',
        'esp8266',
        'esp32',
        'arduino',
        'raspberry_pi',
        'homeautomation',
        'smarthome',
        'industrialiot'
      ]
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      nameEn: 'Blockchain',
      icon: <Database className="w-6 h-6" />,
      subreddits: [
        'blockchain',
        'CryptoTechnology',
        'ethereum',
        'web3',
        'smartcontracts',
        'defi',
        'BlockchainNews',
        'BlockchainStartups',
        'hyperledger'
      ]
    }
  ];

  // Fonction pour obtenir les subreddits en fonction de la catégorie sélectionnée
  const getSubreddits = () => {
    if (selectedCategory === 'all') {
      return [
        'technology',
        'Futurology',
        'tech',
        'technews',
        'TechNewsToday',
        'programming',
        'coding',
        'compsci',
        'softwareengineering',
        'cybersecurity',
        ...categories.flatMap(cat => cat.subreddits)
      ];
    }
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.subreddits : ['technology'];
  };
  // Fonction de délai
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Requête Reddit avec gestion d'erreur améliorée
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['redditPosts', selectedCategory],
    queryFn: async () => {
      try {
        const subreddits = getSubreddits();
        const promises = subreddits.map(async subreddit => {
          try {
            //éviter l'erreur 429
            await delay(2000);
            // pour éviter le CORS et le FETCH marche partiellement mais solution à trouver
            const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=2`);
            // ca marche via localhost 
            // const response = await fetch(`/reddit/r/${subreddit}/hot.json?limit=5`);
            if (!response.ok) {
              console.warn(`Failed to fetch from r/${subreddit}: ${response.status}`);
              return [];
            }
            const data = await response.json();
            return data.data.children.map((child: any) => ({
              ...child.data,
              subreddit: child.data.subreddit
            }));
          } catch (error) {
            console.warn(`Error fetching from r/${subreddit}:`, error);
            return [];
          }
        });
        
        const results = await Promise.all(promises);
        const validPosts = results.flat().filter(post => post !== null);
        
        // Trier par date de création (plus récent en premier)
        return validPosts.sort((a, b) => b.created_utc - a.created_utc);
      } catch (error) {
        console.error('Error fetching Reddit posts:', error);
        throw new Error('Failed to fetch posts');
      }
    },
    retry: 3, // Réessayer 3 fois en cas d'échec
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Délai exponentiel
    staleTime: 5 * 60 * 1000, // Considérer les données comme fraîches pendant 5 minutes
    refetchOnWindowFocus: false // Ne pas rafraîchir automatiquement lors du focus de la fenêtre
  });

  const filteredPosts = (posts as RedditPost[]).filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.selftext.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp * 1000), {
      addSuffix: true,
      locale: language === 'fr' ? fr : enUS
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BookMarked className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                {language === 'fr' ? 'Veille Technologique' : 'Technology Watch'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-4 rounded-lg border ${
              selectedCategory === 'all'
                ? 'bg-indigo-50 border-indigo-500'
                : 'bg-white border-gray-200 hover:border-indigo-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <span className="font-medium">
                {language === 'fr' ? 'Toutes les technologies' : 'All Technologies'}
              </span>
            </div>
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border ${
                selectedCategory === category.id
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'bg-white border-gray-200 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                {category.icon}
                <span className="font-medium">
                  {language === 'fr' ? category.name : category.nameEn}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Reddit Posts */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">
              {language === 'fr' ? 'Chargement des données...' : 'Loading data...'}
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            {language === 'fr' 
              ? 'Erreur lors du chargement des données. Veuillez réessayer plus tard.'
              : 'Error loading data. Please try again later.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-indigo-600">r/{post.subreddit}</span>
                      <span className="text-sm text-gray-500">{formatDate(post.created_utc)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      <a 
                        href={`https://reddit.com${post.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600 flex items-center"
                      >
                        {post.title}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </h3>
                    {post.selftext && (
                      <p className="mt-2 text-gray-600 line-clamp-3">{post.selftext}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <ArrowBigUp className="h-4 w-4" />
                    <span>{post.ups}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.num_comments}</span>
                  </div>
                  {post.url && post.url !== `https://reddit.com${post.permalink}` && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{language === 'fr' ? 'Source originale' : 'Original source'}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <PresentationChart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {language === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {language === 'fr' 
                ? 'Essayez de modifier vos filtres ou votre recherche'
                : 'Try adjusting your filters or search term'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;