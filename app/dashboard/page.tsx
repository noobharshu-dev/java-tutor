"use client";

import React from "react";
import { PlumbHeader } from "@/components/plumb-header";
import { PlumbTerrain } from "@/components/plumb-terrain";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PlumbHeader />

      <main className="plumb-main flex-1">
        <section aria-label="Knowledge terrain">
          <div className="head">
            <div>
              <h1>Your physics, mapped</h1>
              <p>
                Every concept is a place. Higher ground means stronger understanding. Unexplored areas stay in fog until Plumb has enough evidence to draw them.
              </p>
            </div>
            <div className="elev">
              <div>
                <b className="num">58%</b>
                <span>Electricity &amp; Light</span>
              </div>
              <div>
                <b className="num">3</b>
                <span>valleys to cross</span>
              </div>
            </div>
          </div>

          <PlumbTerrain />
        </section>
      </main>
    </div>
  );
}
