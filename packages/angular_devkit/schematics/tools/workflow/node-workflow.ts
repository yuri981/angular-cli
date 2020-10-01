/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Path, getSystemPath, normalize, schema, virtualFs } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import {
  workflow,
} from '@angular-devkit/schematics';  // tslint:disable-line:no-implicit-dependencies
import { BuiltinTaskExecutor } from '../../tasks/node';
import { FileSystemEngine } from '../description';
import { NodeModulesEngineHost } from '../node-module-engine-host';

/**
 * A workflow specifically for Node tools.
 */
export class NodeWorkflow extends workflow.BaseWorkflow {
  constructor(root: string, options: {
    force?: boolean;
    dryRun?: boolean;
    packageManager?: string;
    packageRegistry?: string;
    registry?: schema.CoreSchemaRegistry;
    resolvePaths?: string[],
  });

  constructor(
    host: virtualFs.Host,
    options: {
      force?: boolean;
      dryRun?: boolean;
      root?: Path;
      packageManager?: string;
      packageRegistry?: string;
      registry?: schema.CoreSchemaRegistry;
      resolvePaths?: string[],
    },
  );

  constructor(
    hostOrRoot: virtualFs.Host | string,
    options: {
      force?: boolean;
      dryRun?: boolean;
      root?: Path;
      packageManager?: string;
      packageRegistry?: string;
      registry?: schema.CoreSchemaRegistry;
      resolvePaths?: string[],
    },
  ) {
    let host;
    let root;
    if (typeof hostOrRoot === 'string') {
      root = normalize(hostOrRoot);
      host = new virtualFs.ScopedHost(new NodeJsSyncHost(), root);
    } else {
      host = hostOrRoot;
      root = options.root;
    }

    const engineHost = new NodeModulesEngineHost(options.resolvePaths);
    super({
      host,
      engineHost,

      force: options.force,
      dryRun: options.dryRun,
      registry: options.registry,
    });

    engineHost.registerTaskExecutor(
      BuiltinTaskExecutor.NodePackage,
      {
        allowPackageManagerOverride: true,
        packageManager: options.packageManager,
        rootDirectory: root && getSystemPath(root),
        registry: options.packageRegistry,
      },
    );
    engineHost.registerTaskExecutor(
      BuiltinTaskExecutor.RepositoryInitializer,
      {
        rootDirectory: root && getSystemPath(root),
      },
    );
    engineHost.registerTaskExecutor(BuiltinTaskExecutor.RunSchematic);
    engineHost.registerTaskExecutor(BuiltinTaskExecutor.TslintFix);

    this._context = [];
  }

  get engine(): FileSystemEngine {
    return this._engine as FileSystemEngine;
  }
  get engineHost(): NodeModulesEngineHost {
    return this._engineHost as NodeModulesEngineHost;
  }
}
