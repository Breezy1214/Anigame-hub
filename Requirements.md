# AniGame Hub – Requirements Document

## 1. Customer Statement of Requirements

AniGame Hub is a web application designed for anime fans and video game players who want one place to organize and track the media they consume.

The application will allow users to create an account, search for anime and video games, save titles to their personal profile, rate titles, mark favorites, and track their viewing or playing progress.

Users will be able to organize titles into the following statuses:

* Watched / Played
* In Progress
* Plan to Watch / Play
* Dropped

The application will also include a personal dashboard that displays saved media, favorites, current progress, and recently updated titles. Users will have a public profile that can be shared with others so visitors can view their lists, ratings, favorites, and activity.

The first version of AniGame Hub will focus on providing the core media-tracking features. Anime and video game information will be retrieved from external APIs instead of storing complete media catalogs in the application's database.

---

## 2. Requirements Specification

### Functional Requirements

**FR-1: User Registration**
The system shall allow users to create an account using an email address and password.

**FR-2: User Authentication**
The system shall allow registered users to log in and log out securely.

**FR-3: User Profile**
The system shall provide each user with a profile containing their saved anime and games, ratings, favorites, and progress.

**FR-4: Anime Search**
The system shall allow users to search for anime titles using an external anime API.

**FR-5: Video Game Search**
The system shall allow users to search for video games using an external gaming API.

**FR-6: Media Details**
The system shall display information about anime and games, including:

* Title
* Cover image
* Description
* Genre
* Release date
* Episode count for anime
* Platform information for games

**FR-7: Save Media**
The system shall allow authenticated users to save anime or games to their personal media list.

**FR-8: Media Status**
The system shall allow users to assign a status to saved media.

Available statuses shall include:

* Watched / Played
* In Progress
* Plan to Watch / Play
* Dropped

**FR-9: Progress Tracking**
The system shall allow users to update their progress for saved media.

**FR-10: Ratings**
The system shall allow users to rate anime and games they have saved.

**FR-11: Favorites**
The system shall allow users to mark or remove titles as favorites.

**FR-12: Dashboard**
The system shall provide a dashboard displaying:

* Saved media
* Favorites
* Media currently in progress
* Recently updated titles

**FR-13: Remove Media**
The system shall allow users to remove anime or games from their personal lists.

**FR-14: Public Profile**
The system shall allow users to have a public profile containing their media lists, ratings, favorites, and current activity.

**FR-15: Profile Sharing**
The system shall provide a shareable URL for each public profile.

---

### Non-Functional Requirements

**NFR-1: Usability**
The application shall provide a simple and easy-to-use interface.

**NFR-2: Performance**
Pages should load within approximately three seconds under normal network conditions, excluding delays caused by external APIs.

**NFR-3: Responsive Design**
The application shall work properly on desktop, tablet, and mobile devices.

**NFR-4: Security**
User authentication and account information shall be securely managed using Supabase Authentication.

**NFR-5: Data Privacy**
Users shall only be able to modify information associated with their own accounts.

**NFR-6: Reliability**
The application shall handle API errors without crashing and provide users with an appropriate error message.

**NFR-7: Maintainability**
The application shall use reusable React components and TypeScript to maintain organized and type-safe code.

**NFR-8: Scalability**
The application's database structure shall support additional users and saved media as the application grows.

**NFR-9: API Efficiency**
The complete anime and game catalogs shall not be stored in the application's database. Media catalog information shall instead be retrieved from external APIs.

**NFR-10: Accessibility**
Buttons, forms, navigation controls, and other important interface elements shall use clear labels and accessible HTML elements.

---

## 3. Data and Storage Blueprint

### Data Input

AniGame Hub will receive data from two primary sources: users and external APIs.

### User Input

Users will manually provide information such as:

* Email address
* Password
* Username
* Media rating
* Media status
* Progress
* Favorite status

Users will enter or update this information through forms, buttons, rating controls, and progress controls within the application.

### External API Input

Anime and video game information will be retrieved from external APIs.

Possible anime APIs include:

* AniList
* Jikan

Possible video game APIs include:

* RAWG
* IGDB

The APIs will provide information such as:

* Media ID
* Title
* Cover image
* Description
* Genres
* Release date
* Episode count
* Gaming platforms

The application will use these APIs when users search for anime or video games.

The complete anime and game catalogs will not be stored locally in the application's database.

---

### Database and Storage

AniGame Hub will use **Supabase** as its backend platform.

Supabase provides:

* PostgreSQL database
* User authentication
* Backend services
* Database API access

The primary database for AniGame Hub will therefore be **PostgreSQL**.

The database will store information related to the user's activity rather than complete anime or video game catalogs.

Examples of stored information include:

* User profiles
* Saved anime and games
* External media IDs
* Media type
* Ratings
* Favorites
* Progress
* Tracking status
* Profile settings

A saved media record may contain fields such as:

| Field             | Description                           |
| ----------------- | ------------------------------------- |
| id                | Unique database record                |
| user_id           | User who saved the media              |
| external_media_id | ID of the title from the external API |
| media_type        | Anime or game                         |
| title             | Name of the media                     |
| cover_url         | Cover image URL                       |
| status            | User's tracking status                |
| rating            | User's rating                         |
| progress          | User's current progress               |
| favorite          | Whether the title is a favorite       |
| updated_at        | Last time the record was updated      |

The `user_id` will connect saved media to the correct user.

The `external_media_id` will connect the saved record to the corresponding anime or game from the external API.

Detailed information about a title can be retrieved from the external API when needed instead of storing the entire catalog in Supabase.

